package data

import (
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"

	"dreampos/internal/auth"
	"dreampos/internal/config"
	"dreampos/internal/order"
	"dreampos/internal/payment"
	"dreampos/internal/refund"
	"dreampos/internal/reservation"
)

type PostgresDb struct {
	Db *sqlx.DB
}

func MustCreatePostgresDb(config config.Config) PostgresDb {
	dbDataSource := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		config.DbHostname,
		config.DbPort,
		config.DbName,
		config.DbUser,
		config.DbPass)

	return PostgresDb{
		Db: sqlx.MustConnect("postgres", dbDataSource),
	}
}

// -------------------------------------------------------------------------------------------------
// auth.UserRepo implimentation --------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetUserDetails(username string) (auth.UserDetails, error) {
	var userDetails auth.UserDetails
	var userId int32

	{
		const query = `
		SELECT id, password_hash
		FROM employee
		WHERE username = $1
		LIMIT 1
		`

		var user struct {
			Id           int32  `db:"id"`
			PasswordHash string `db:"password_hash"`
		}

		err := pdb.Db.Get(&user, query, username)
		if err != nil {
			return auth.UserDetails{}, err
		}

		userId = user.Id
		userDetails.PasswordHash = user.PasswordHash
	}
	{
		const query = `
		SELECT role.name
		FROM employee_role
		JOIN role
			ON role_id = role.id
			AND employee_id = $1
		`

		var rolesNames []string

		err := pdb.Db.Select(&rolesNames, query, userId)
		if err != nil {
			return auth.UserDetails{}, err
		}

		userDetails.Roles = rolesNames
	}

	return userDetails, nil
}

func (pdb PostgresDb) GetUserCurrency(username string) (string, error) {
	var currency string

	const query = `
    SELECT country.currency
	FROM employee
	JOIN business
		ON business.id = employee.business_id
	JOIN location
		ON location.business_id = business.id
	JOIN country
		ON country.code = location.country_code
	WHERE employee.username = $1
	ORDER BY location.name ASC
	LIMIT 1
	`

	err := pdb.Db.Get(&currency, query, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", fmt.Errorf("user not found")
		}
		slog.Error(err.Error())
		return "", ErrInternal
	}

	return strings.ToUpper(currency), nil
}

func (pdb PostgresDb) GetBusinessInfo(username string) (auth.BusinessInfo, error) {
	var businessInfo auth.BusinessInfo

	{
		query := `
		SELECT business.id
		FROM employee
		JOIN business
			ON business.id = employee.business_id
		WHERE employee.username = $1
		LIMIT 1
		`
		err := pdb.Db.Get(&businessInfo.Id, query, username)
		if err != nil {
			slog.Error(err.Error())
			return auth.BusinessInfo{}, ErrInternal
		}
	}
	{
		const query = `
		SELECT location.id, location.name
		FROM business
		JOIN location
			ON location.business_id = business.id
		WHERE business.id = $1
		ORDER BY location.name ASC
		`
		err := pdb.Db.Select(&businessInfo.Locations, query, businessInfo.Id)
		if err != nil {
			slog.Error(err.Error())
			return auth.BusinessInfo{}, ErrInternal
		}
	}

	return businessInfo, nil
}

// -------------------------------------------------------------------------------------------------
// order.OrderRepo implimentation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetOrders(filter order.OrderFilter) ([]order.OrderSummary, error) {
	if filter.OrderStatus != nil {
		*filter.OrderStatus = strings.ToUpper(*filter.OrderStatus)
	}

	const query = `
	SELECT id, total, created_at, status
	FROM order_detail
	WHERE 
		($1::order_status IS NULL OR status = $1::order_status)
		AND ($2::timestamp IS NULL OR $2::timestamp <= created_at)
		AND ($3::timestamp IS NULL OR created_at <= $3::timestamp)
		AND ($4::bigint IS NULL OR id = $4::bigint)
	ORDER BY
		id DESC
	LIMIT COALESCE($5::bigint, 100)
	OFFSET COALESCE($6::bigint, 0)
	`

	orders := []order.OrderSummary{}
	err := pdb.Db.Select(&orders, query, filter.OrderStatus, filter.From, filter.To, filter.Id, filter.Limit, filter.Offset)
	if err != nil {
		slog.Error(err.Error())
		return []order.OrderSummary{}, ErrInternal
	}

	for i := range orders {
		orders[i].Status = strings.ToLower(orders[i].Status)
	}

	return orders, nil
}

// TODO: implement or remove idk
func (pdb PostgresDb) GetOrderCounts(filter order.OrderFilter) (order.OrderCounts, error) {
	return order.OrderCounts{}, nil
}

func (pdb PostgresDb) CreateOrder(username string, order order.Order) (int64, error) {
	currency := strings.ToUpper(order.Currency)

	employeeID := int64(0)
	{
		const query = `
		SELECT id
		FROM employee
		WHERE username = $1
		LIMIT 1
		`
		if err := pdb.Db.Get(&employeeID, query, username); err != nil {
			slog.Error(err.Error())
			return 0, ErrInternal
		}
		if employeeID <= 0 {
			return 0, ErrInternal
		}
	}

	createOrderStatement := `
	INSERT INTO order_data (employee_id, currency)
		VALUES ($1, $2)
		RETURNING id
	`

	orderId := int64(-1)
	err := pdb.Db.QueryRow(createOrderStatement, employeeID, currency).Scan(&orderId)
	if err != nil {
		slog.Error(err.Error())
		return 0, ErrInternal
	}

	err = pdb.ModifyOrder(orderId, order)
	if err != nil {
		slog.Error(err.Error())
		return 0, ErrInternal
	}

	return orderId, nil
}

func (pdb PostgresDb) ModifyOrder(orderId int64, order order.Order) error {
	{
		checkIfOrderIsOpenQuery := `
		SELECT COUNT(*)
		FROM order_data
		WHERE 
			id = $1
			AND status = 'OPEN'
		`
		matchedOrderCount := 0
		err := pdb.Db.QueryRow(checkIfOrderIsOpenQuery, orderId).Scan(&matchedOrderCount)
		if err != nil {
			slog.Error(err.Error())
			return ErrInternal
		}
		if matchedOrderCount != 1 {
			slog.Error(fmt.Sprintf("expected to 1 row, got %d.", matchedOrderCount))
			return ErrInternal
		}
	}

	transaction, err := pdb.Db.Begin()
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}

	if order.Tip > -1 {
		updateOrderInfoStatement := `
		UPDATE order_data
		SET tip = $2
		WHERE id = $1
		`

		err = pdb.Db.QueryRow(updateOrderInfoStatement, orderId, order.Tip).Err()
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
	}

	for _, item := range order.Items {
		if item.Id > 0 {
			itemModificationStatement := `
			UPDATE order_item
			SET
				order_id = $2,
				item_id  = $3,
				quantity = $4
			WHERE id = $1
			RETURNING id
			`
			err = pdb.Db.QueryRow(itemModificationStatement, item.Id, orderId, item.Product.Id, item.Quantity).Scan(&item.Id)
		} else {
			itemModificationStatement := `
			INSERT INTO order_item (order_id, item_id, quantity)
				VALUES ($1, $2, $3)
			RETURNING id
			`
			err = pdb.Db.QueryRow(itemModificationStatement, orderId, item.Product.Id, item.Quantity).Scan(&item.Id)
		}

		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}

		// Very safe
		nukeVariationsStatement := `
		DELETE FROM order_item_variation 
		WHERE order_item_id = $1
		`
		_, err = pdb.Db.Exec(nukeVariationsStatement, item.Id)

		for _, variation := range item.SelectedVariations {
			const insertVariationStatement = `
			INSERT INTO order_item_variation (order_item_id, variation_id)
				VALUES ($1, $2)
			`
			err = pdb.Db.QueryRow(insertVariationStatement, item.Id, variation.Id).Err()
			if err != nil {
				slog.Error(err.Error())
				_ = transaction.Rollback()
				return ErrInternal
			}
		}
	}

	_ = transaction.Commit()

	return nil
}

func (pdb PostgresDb) MarkOrderClosed(orderID int64) error {
	const query = `
	UPDATE order_data
	SET status = 'CLOSED'
	WHERE id = $1
		AND status = 'OPEN'
	`

	res, err := pdb.Db.Exec(query, orderID)
	if err != nil {
		slog.Error("Failed to mark order as closed", "error", err, "order_id", orderID)
		return ErrInternal
	}

	_, _ = res.RowsAffected()

	return nil
}

func (pdb PostgresDb) CreateRefundRequest(orderId int64, refundData order.RefundData) error {
	transaction, err := pdb.Db.Beginx()
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}

	{
		const orderStatusStatement = `
		UPDATE order_data
		SET status = 'REFUND_PENDING'
		WHERE
			id = $1
			AND status = 'CLOSED'
		`

		res, err := transaction.Exec(orderStatusStatement, orderId)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
		rows, err := res.RowsAffected()
		if err != nil || rows != 1 {
			slog.Error("unexpected rows affected when setting refund pending", "rows", rows, "error", err)
			_ = transaction.Rollback()
			return ErrInternal
		}
	}
	{
		const refundDataStatement = `
		INSERT INTO refund_data (order_id, name, phone, email, reason)
			VALUES ($1, $2, $3, $4, $5)
		`

		_, err = transaction.Exec(
			refundDataStatement,
			orderId,
			refundData.Name,
			refundData.Phone,
			refundData.Email,
			refundData.Reason,
		)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
	}

	_ = transaction.Commit()

	return nil
}

func (pdb PostgresDb) CancelRefundRequest(orderId int64) error {
	transaction, err := pdb.Db.Beginx()
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}

	{
		const orderStatusStatement = `
		UPDATE order_data
		SET status = 'CLOSED'
		WHERE
			id = $1
			AND status = 'REFUND_PENDING'
		`

		res, err := transaction.Exec(orderStatusStatement, orderId)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
		rows, err := res.RowsAffected()
		if err != nil || rows != 1 {
			slog.Error("unexpected rows affected when cancelling refund request", "rows", rows, "error", err)
			_ = transaction.Rollback()
			return ErrInternal
		}
	}
	{
		const refundDataStatement = `
		DELETE FROM refund_data
		WHERE order_id = $1
		`

		res, err := transaction.Exec(refundDataStatement, orderId)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}

		numberOfRows, err := res.RowsAffected()
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
		if numberOfRows > 1 {
			slog.Error("tried to delete more than one refund request at a time")
			_ = transaction.Rollback()
			return ErrInternal
		}
	}

	_ = transaction.Commit()

	return nil
}

// -------------------------------------------------------------------------------------------------
// refund.RefundRepo implementation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetPendingRefunds() ([]refund.Refund, error) {
	paymentQuery := `
	SELECT DISTINCT ON (order_id)
		order_id,
		COALESCE(stripe_payment_intent_id, '') AS stripe_payment_intent_id,
		COALESCE(payment_method::TEXT, '') AS payment_method
	FROM payment
	ORDER BY
		order_id,
		(status = 'COMPLETED') DESC,
		updated_at DESC,
		id DESC
	`

	orderQuery := fmt.Sprintf(`
	SELECT
		od.id AS id,
		od.id AS order_id,
		0 AS reservation_id,
		'order' AS refund_type,
		rd.reason AS reason,
		od.created_at AS requested_at,
		CAST(ROUND(odetail.total) AS BIGINT) AS amount_cents,
		COALESCE(p.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
		COALESCE(p.payment_method::TEXT, '') AS payment_method
	FROM order_data od
	JOIN order_detail odetail
		ON odetail.id = od.id
	JOIN refund_data rd
		ON rd.order_id = od.id
	LEFT JOIN (%s) p
		ON p.order_id = od.id
	WHERE od.status = 'REFUND_PENDING'
	`, paymentQuery)

	reservationQuery := fmt.Sprintf(`
	SELECT
		a.id AS id,
		0 AS order_id,
		a.id AS reservation_id,
		'reservation' AS refund_type,
		rrd.reason AS reason,
		COALESCE(ab.created_at, a.appointment_at, NOW()) AS requested_at,
		CAST(ROUND(sl.price) AS BIGINT) AS amount_cents,
		COALESCE(p.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
		COALESCE(p.payment_method::TEXT, '') AS payment_method
	FROM appointment a
	JOIN service_location sl
		ON a.service_location_id = sl.id
	LEFT JOIN (
		SELECT appointment_id, MAX(created_at) AS created_at
		FROM appointment_bill
		GROUP BY appointment_id
	) ab
		ON ab.appointment_id = a.id
	JOIN reservation_refund_data rrd
		ON rrd.appointment_id = a.id
	LEFT JOIN (%s) p
		ON p.order_id = a.id
	WHERE a.status = 'REFUND_PENDING'
	`, paymentQuery)

	combinedQuery := orderQuery + " UNION ALL " + reservationQuery + " ORDER BY requested_at DESC"

	var rows []struct {
		ID                    int64     `db:"id"`
		OrderID               int64     `db:"order_id"`
		ReservationID         int64     `db:"reservation_id"`
		RefundType            string    `db:"refund_type"`
		Reason                string    `db:"reason"`
		RequestedAt           time.Time `db:"requested_at"`
		AmountCents           int64     `db:"amount_cents"`
		StripePaymentIntentID string    `db:"stripe_payment_intent_id"`
		PaymentMethod         string    `db:"payment_method"`
	}

	if err := pdb.Db.Select(&rows, combinedQuery); err != nil {
		slog.Error("Failed to get pending refunds", "error", err)
		return nil, ErrInternal
	}

	refunds := make([]refund.Refund, 0, len(rows))
	for _, row := range rows {
		refundItem := refund.Refund{
			ID:                    uint32(row.ID),
			RefundType:            row.RefundType,
			Amount:                float64(row.AmountCents) / 100.0,
			AmountCents:           row.AmountCents,
			Reason:                row.Reason,
			Status:                refund.StatusPending,
			RequestedAt:           row.RequestedAt,
			StripePaymentIntentID: row.StripePaymentIntentID,
			PaymentMethod:         strings.ToLower(row.PaymentMethod),
		}

		if row.OrderID > 0 {
			refundItem.OrderID = uint32(row.OrderID)
		}
		if row.ReservationID > 0 {
			refundItem.ReservationID = uint32(row.ReservationID)
		}

		refunds = append(refunds, refundItem)
	}

	return refunds, nil
}

func (pdb PostgresDb) GetRefundByID(id uint32) (*refund.Refund, error) {
	paymentQuery := `
	SELECT DISTINCT ON (order_id)
		order_id,
		COALESCE(stripe_payment_intent_id, '') AS stripe_payment_intent_id,
		COALESCE(payment_method::TEXT, '') AS payment_method
	FROM payment
	ORDER BY
		order_id,
		(status = 'COMPLETED') DESC,
		updated_at DESC,
		id DESC
	`

	orderQuery := fmt.Sprintf(`
	SELECT
		od.id AS id,
		od.id AS order_id,
		0 AS reservation_id,
		'order' AS refund_type,
		rd.reason AS reason,
		od.created_at AS requested_at,
		CAST(ROUND(odetail.total) AS BIGINT) AS amount_cents,
		COALESCE(p.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
		COALESCE(p.payment_method::TEXT, '') AS payment_method
	FROM order_data od
	JOIN order_detail odetail
		ON odetail.id = od.id
	JOIN refund_data rd
		ON rd.order_id = od.id
	LEFT JOIN (%s) p
		ON p.order_id = od.id
	WHERE od.id = $1
		AND od.status = 'REFUND_PENDING'
	LIMIT 1
	`, paymentQuery)

	reservationQuery := fmt.Sprintf(`
	SELECT
		a.id AS id,
		0 AS order_id,
		a.id AS reservation_id,
		'reservation' AS refund_type,
		rrd.reason AS reason,
		COALESCE(ab.created_at, a.appointment_at, NOW()) AS requested_at,
		CAST(ROUND(sl.price) AS BIGINT) AS amount_cents,
		COALESCE(p.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
		COALESCE(p.payment_method::TEXT, '') AS payment_method
	FROM appointment a
	JOIN service_location sl
		ON a.service_location_id = sl.id
	LEFT JOIN (
		SELECT appointment_id, MAX(created_at) AS created_at
		FROM appointment_bill
		GROUP BY appointment_id
	) ab
		ON ab.appointment_id = a.id
	JOIN reservation_refund_data rrd
		ON rrd.appointment_id = a.id
	LEFT JOIN (%s) p
		ON p.order_id = a.id
	WHERE a.id = $1
		AND a.status = 'REFUND_PENDING'
	LIMIT 1
	`, paymentQuery)

	var row struct {
		ID                    int64     `db:"id"`
		OrderID               int64     `db:"order_id"`
		ReservationID         int64     `db:"reservation_id"`
		RefundType            string    `db:"refund_type"`
		Reason                string    `db:"reason"`
		RequestedAt           time.Time `db:"requested_at"`
		AmountCents           int64     `db:"amount_cents"`
		StripePaymentIntentID string    `db:"stripe_payment_intent_id"`
		PaymentMethod         string    `db:"payment_method"`
	}

	err := pdb.Db.Get(&row, orderQuery, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			err = pdb.Db.Get(&row, reservationQuery, id)
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					return nil, errors.New("refund not found")
				}
				slog.Error("Failed to get reservation refund by ID", "error", err, "id", id)
				return nil, ErrInternal
			}
		} else {
			slog.Error("Failed to get order refund by ID", "error", err, "order_id", id)
			return nil, ErrInternal
		}
	}

	refundItem := &refund.Refund{
		ID:                    uint32(row.ID),
		RefundType:            row.RefundType,
		Amount:                float64(row.AmountCents) / 100.0,
		AmountCents:           row.AmountCents,
		Reason:                row.Reason,
		Status:                refund.StatusPending,
		RequestedAt:           row.RequestedAt,
		StripePaymentIntentID: row.StripePaymentIntentID,
		PaymentMethod:         strings.ToLower(row.PaymentMethod),
	}

	if row.OrderID > 0 {
		refundItem.OrderID = uint32(row.OrderID)
	}
	if row.ReservationID > 0 {
		refundItem.ReservationID = uint32(row.ReservationID)
	}

	return refundItem, nil
}

func (pdb PostgresDb) UpdateRefundStatus(id uint32, status refund.RefundStatus, stripeRefundID string) (*refund.Refund, error) {
	refundRecord, err := pdb.GetRefundByID(id)
	if err != nil {
		return nil, err
	}

	transaction, err := pdb.Db.Beginx()
	if err != nil {
		slog.Error(err.Error())
		return nil, ErrInternal
	}

	rollback := func(err error) (*refund.Refund, error) {
		_ = transaction.Rollback()
		return nil, err
	}

	isOrder := refundRecord.RefundType == "order"

	switch status {
	case refund.StatusDisapproved:
		{
			if isOrder {
				const updateOrder = `
				UPDATE order_data
				SET status = 'CLOSED'
				WHERE id = $1 AND status = 'REFUND_PENDING'
				`
				res, err := transaction.Exec(updateOrder, id)
				if err != nil {
					slog.Error("Failed to update order status for disapproved refund", "error", err, "order_id", id)
					return rollback(ErrInternal)
				}
				rows, err := res.RowsAffected()
				if err != nil || rows != 1 {
					slog.Error("Unexpected rows affected when disapproving refund", "rows", rows, "error", err, "order_id", id)
					return rollback(errors.New("refund not found"))
				}

				const deleteRefundData = `DELETE FROM refund_data WHERE order_id = $1`
				if _, err := transaction.Exec(deleteRefundData, id); err != nil {
					slog.Error("Failed to delete refund_data for disapproved refund", "error", err, "order_id", id)
					return rollback(ErrInternal)
				}
			} else {
				const updateAppointment = `
				UPDATE appointment
				SET status = 'COMPLETED'
				WHERE id = $1 AND status = 'REFUND_PENDING'
				`
				res, err := transaction.Exec(updateAppointment, id)
				if err != nil {
					slog.Error("Failed to update appointment status for disapproved refund", "error", err, "appointment_id", id)
					return rollback(ErrInternal)
				}
				rows, err := res.RowsAffected()
				if err != nil || rows != 1 {
					slog.Error("Unexpected rows affected when disapproving reservation refund", "rows", rows, "error", err, "appointment_id", id)
					return rollback(errors.New("refund not found"))
				}

				const deleteRefundData = `DELETE FROM reservation_refund_data WHERE appointment_id = $1`
				if _, err := transaction.Exec(deleteRefundData, id); err != nil {
					slog.Error("Failed to delete reservation_refund_data for disapproved refund", "error", err, "appointment_id", id)
					return rollback(ErrInternal)
				}
			}
		}
	case refund.StatusCompleted:
		{
			if isOrder {
				const updateOrder = `
				UPDATE order_data
				SET status = 'REFUNDED'
				WHERE id = $1 AND status = 'REFUND_PENDING'
				`
				res, err := transaction.Exec(updateOrder, id)
				if err != nil {
					slog.Error("Failed to update order status for completed refund", "error", err, "order_id", id)
					return rollback(ErrInternal)
				}
				rows, err := res.RowsAffected()
				if err != nil || rows != 1 {
					slog.Error("Unexpected rows affected when completing refund", "rows", rows, "error", err, "order_id", id)
					return rollback(errors.New("refund not found"))
				}

				const deleteRefundData = `DELETE FROM refund_data WHERE order_id = $1`
				if _, err := transaction.Exec(deleteRefundData, id); err != nil {
					slog.Error("Failed to delete refund_data for completed refund", "error", err, "order_id", id)
					return rollback(ErrInternal)
				}
			} else {
				const updateAppointment = `
				UPDATE appointment
				SET status = 'REFUNDED'
				WHERE id = $1 AND status = 'REFUND_PENDING'
				`
				res, err := transaction.Exec(updateAppointment, id)
				if err != nil {
					slog.Error("Failed to update appointment status for completed refund", "error", err, "appointment_id", id)
					return rollback(ErrInternal)
				}
				rows, err := res.RowsAffected()
				if err != nil || rows != 1 {
					slog.Error("Unexpected rows affected when completing reservation refund", "rows", rows, "error", err, "appointment_id", id)
					return rollback(errors.New("refund not found"))
				}

				const deleteRefundData = `DELETE FROM reservation_refund_data WHERE appointment_id = $1`
				if _, err := transaction.Exec(deleteRefundData, id); err != nil {
					slog.Error("Failed to delete reservation_refund_data for completed refund", "error", err, "appointment_id", id)
					return rollback(ErrInternal)
				}
			}
		}
	default:
		{
			if isOrder {
				const ensurePending = `
				SELECT id
				FROM order_data
				WHERE id = $1 AND status = 'REFUND_PENDING'
				LIMIT 1
				`
				var orderID int64
				if err := transaction.Get(&orderID, ensurePending, id); err != nil {
					if errors.Is(err, sql.ErrNoRows) {
						return rollback(errors.New("refund not found"))
					}
					slog.Error("Failed to verify refund status update", "error", err, "order_id", id)
					return rollback(ErrInternal)
				}
			} else {
				const ensurePending = `
				SELECT id
				FROM appointment
				WHERE id = $1 AND status = 'REFUND_PENDING'
				LIMIT 1
				`
				var appointmentID int64
				if err := transaction.Get(&appointmentID, ensurePending, id); err != nil {
					if errors.Is(err, sql.ErrNoRows) {
						return rollback(errors.New("refund not found"))
					}
					slog.Error("Failed to verify reservation refund status update", "error", err, "appointment_id", id)
					return rollback(ErrInternal)
				}
			}
		}
	}

	if err := transaction.Commit(); err != nil {
		slog.Error("Failed to commit refund status update", "error", err, "id", id)
		return nil, ErrInternal
	}

	result := &refund.Refund{
		ID:             id,
		RefundType:     refundRecord.RefundType,
		Status:         status,
		StripeRefundID: stripeRefundID,
	}

	if isOrder {
		result.OrderID = id
	} else {
		result.ReservationID = id
	}

	return result, nil
}

func (pdb PostgresDb) GetOrderItems(orderId int64) ([]order.Item, error) {
	const query = `
	SELECT id, item_id, quantity
	FROM order_item
	WHERE order_id = $1
	`
	var itemsDetails []struct {
		Id       int64  `db:"id"`
		ItemId   int64  `db:"item_id"`
		Quantity uint16 `db:"quantity"`
	}

	err := pdb.Db.Select(&itemsDetails, query, orderId)
	if err != nil {
		slog.Error(err.Error())
		return []order.Item{}, ErrInternal
	}

	items := make([]order.Item, len(itemsDetails))
	for i := range itemsDetails {
		items[i].Id = itemsDetails[i].Id
		items[i].Quantity = itemsDetails[i].Quantity
		items[i].SelectedVariations = []order.Variation{}
		items[i].Product.Variations = []order.Variation{}
		items[i].Product.Categories = []string{}

		const productQuery = `
		SELECT id, name, price_per_unit
		FROM item
		WHERE id = $1
		LIMIT 1
		`

		err = pdb.Db.Get(&items[i].Product, productQuery, itemsDetails[i].ItemId)
		if err != nil {
			slog.Error(err.Error())
			return []order.Item{}, ErrInternal
		}

		const selectedVariationQuery = `
		SELECT item_variation.id, item_variation.name, price_difference
		FROM order_item
		JOIN order_item_variation
			ON order_item.id = order_item_variation.order_item_id
		JOIN item_variation
			ON order_item_variation.variation_id = item_variation.id
		WHERE 
			order_item.order_id = $1
			AND order_item.item_id = $2;
		`

		err = pdb.Db.Select(&items[i].SelectedVariations, selectedVariationQuery, orderId, itemsDetails[i].ItemId)
		if err != nil {
			slog.Error(err.Error())
			return []order.Item{}, ErrInternal
		}
	}

	return items, nil
}

// -------------------------------------------------------------------------------------------------
// order.ProductRepo implimentation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetProducts(filter order.ProductFilter) ([]order.Product, error) {
	var filteredProducts []order.Product
	{
		const query = `
		SELECT item.id, item.name, price_per_unit
		FROM item
		JOIN item_category
			ON item.id = item_id
		JOIN category
			ON category.id = category_id
		WHERE 
			item.status = 'ACTIVE'
			AND ($1::text IS NULL OR category.name = $1::text)
		ORDER BY
			item.name ASC
		`

		err := pdb.Db.Select(&filteredProducts, query, filter.Category)
		if err != nil {
			slog.Error(err.Error())
			return []order.Product{}, ErrInternal
		}
	}
	{
		const query = `
		SELECT category.name
		FROM item_category
		JOIN category
			ON item_category.item_id = $1
			AND category.id = category_id
		`

		for i := range filteredProducts {
			err := pdb.Db.Select(&filteredProducts[i].Categories, query, filteredProducts[i].Id)
			if err != nil {
				slog.Error(err.Error())
				return []order.Product{}, ErrInternal
			}
		}
	}
	{
		const query = `
		SELECT id, name, price_difference
		FROM item_variation
		WHERE item_id = $1
		`

		for i := range filteredProducts {
			err := pdb.Db.Select(&filteredProducts[i].Variations, query, filteredProducts[i].Id)
			if err != nil {
				slog.Error(err.Error())
				return []order.Product{}, ErrInternal
			}
		}
	}

	return filteredProducts, nil
}

func (pdb PostgresDb) GetDefaultVat(locationId int64) (float64, error) {
	var vat float64
	query := `
	SELECT country.vat::DOUBLE PRECISION
	FROM location
	JOIN country
	ON country.code = location.country_code
	WHERE location.id = $1
	LIMIT 1
	`
	err := pdb.Db.Get(&vat, query, locationId)
	if err != nil {
		slog.Error(err.Error())
		return 0, ErrInternal
	}

	return vat, nil
}

// -------------------------------------------------------------------------------------------------
// reservation.ReservationRepo implementation ------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetReservations(filter reservation.ReservationFilter) ([]reservation.Reservation, error) {
	var statusFilter *string
	if filter.Status != nil {
		mapped := mapApiReservationStatusToAppointment(*filter.Status)
		if mapped == "" {
			return []reservation.Reservation{}, nil
		}
		statusFilter = &mapped
	}

	search := ""
	if filter.Search != nil {
		search = strings.TrimSpace(*filter.Search)
	}

	const query = `
	SELECT 
		a.id,
		a.customer_name,
		a.customer_phone,
		a.actioned_by,
		a.appointment_at,
		a.status,
		sl.service_id
	FROM appointment a
	JOIN service_location sl
		ON a.service_location_id = sl.id
	LEFT JOIN service s
		ON sl.service_id = s.id
	LEFT JOIN employee e
		ON a.actioned_by = e.id
	WHERE 
		($1::appointment_status IS NULL OR a.status = $1::appointment_status)
		AND ($2::timestamp IS NULL OR a.appointment_at >= $2::timestamp)
		AND ($3::timestamp IS NULL OR a.appointment_at <= $3::timestamp)
		AND (
			$4 = '' OR
			a.customer_name ILIKE '%' || $4 || '%' OR
			a.customer_phone ILIKE '%' || $4 || '%' OR
			s.name ILIKE '%' || $4 || '%' OR
			e.first_name ILIKE '%' || $4 || '%' OR
			e.last_name ILIKE '%' || $4 || '%' OR
			CAST(a.id AS TEXT) ILIKE '%' || $4 || '%'
		)
	ORDER BY
		a.id DESC
	`

	rows := []struct {
		Id            int32     `db:"id"`
		CustomerName  string    `db:"customer_name"`
		CustomerPhone string    `db:"customer_phone"`
		StaffId       int32     `db:"actioned_by"`
		ServiceId     int32     `db:"service_id"`
		Datetime      time.Time `db:"appointment_at"`
		Status        string    `db:"status"`
	}{}

	err := pdb.Db.Select(&rows, query, statusFilter, filter.From, filter.To, search)
	if err != nil {
		slog.Error(err.Error())
		return []reservation.Reservation{}, ErrInternal
	}

	reservations := make([]reservation.Reservation, 0, len(rows))
	for _, row := range rows {
		reservations = append(reservations, reservation.Reservation{
			Id:            strconv.FormatInt(int64(row.Id), 10),
			CustomerName:  row.CustomerName,
			CustomerPhone: row.CustomerPhone,
			StaffId:       strconv.FormatInt(int64(row.StaffId), 10),
			ServiceId:     strconv.FormatInt(int64(row.ServiceId), 10),
			Datetime:      row.Datetime,
			Status:        mapAppointmentStatusToApi(row.Status),
		})
	}

	return reservations, nil
}

func (pdb PostgresDb) GetReservationCounts(filter reservation.ReservationFilter) (reservation.ReservationCounts, error) {
	const query = `
	SELECT 
		status,
		COUNT(*) AS count
	FROM appointment
	WHERE 
		($1::timestamp IS NULL OR appointment_at >= $1::timestamp)
		AND ($2::timestamp IS NULL OR appointment_at <= $2::timestamp)
	GROUP BY status
	`

	rows := []struct {
		Status string `db:"status"`
		Count  int    `db:"count"`
	}{}

	err := pdb.Db.Select(&rows, query, filter.From, filter.To)
	if err != nil {
		slog.Error(err.Error())
		return reservation.ReservationCounts{}, ErrInternal
	}

	counts := reservation.ReservationCounts{}
	for _, row := range rows {
		counts.All += row.Count
		switch mapAppointmentStatusToApi(row.Status) {
		case "pending":
			counts.Pending += row.Count
		case "confirmed":
			counts.Confirmed += row.Count
		case "completed":
			counts.Completed += row.Count
		case "cancelled":
			counts.Cancelled += row.Count
		case "refund_pending":
			counts.RefundPending += row.Count
		}
	}

	return counts, nil
}

func (pdb PostgresDb) GetReservationItems(reservationId int32) ([]reservation.Service, error) {
	const query = `
	SELECT 
		s.id          AS service_id,
		s.name        AS service_name,
		s.duration_mins,
		sl.price      AS price
	FROM appointment a
	JOIN service_location sl
		ON a.service_location_id = sl.id
	JOIN service s
		ON sl.service_id = s.id
	WHERE a.id = $1
	LIMIT 1
	`

	var row struct {
		ServiceId    int32  `db:"service_id"`
		ServiceName  string `db:"service_name"`
		DurationMins int    `db:"duration_mins"`
		Price        int64  `db:"price"`
	}

	err := pdb.Db.Get(&row, query, reservationId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return []reservation.Service{}, nil
		}
		slog.Error(err.Error())
		return []reservation.Service{}, ErrInternal
	}

	return []reservation.Service{
		{
			Id:       strconv.FormatInt(int64(row.ServiceId), 10),
			Name:     row.ServiceName,
			NameKey:  row.ServiceName,
			Duration: row.DurationMins,
			Price:    int(row.Price),
		},
	}, nil
}

func (pdb PostgresDb) CreateReservation(res reservation.Reservation) (int32, error) {
	serviceId, err := strconv.ParseInt(res.ServiceId, 10, 32)
	if err != nil {
		return 0, ErrInternal
	}

	// Pick a service_location for the given service (cheapest ID).
	var serviceLocationId int32
	{
		const query = `
		SELECT id
		FROM service_location
		WHERE service_id = $1
		ORDER BY id
		LIMIT 1
		`
		err := pdb.Db.Get(&serviceLocationId, query, serviceId)
		if err != nil {
			slog.Error(err.Error())
			return 0, ErrInternal
		}
	}

	// Resolve staff/employee; fallback to any employee linked to the service.
	var actionedBy int32
	staffIdStr := strings.TrimSpace(res.StaffId)
	if staffIdStr != "" && !strings.EqualFold(staffIdStr, "anyone") {
		if staffId, err := strconv.ParseInt(staffIdStr, 10, 32); err == nil {
			actionedBy = int32(staffId)
		} else {
			return 0, ErrInternal
		}
	} else {
		const query = `
		SELECT employee_id
		FROM service_employee
		WHERE service_location_id = $1
		ORDER BY employee_id
		LIMIT 1
		`
		err := pdb.Db.Get(&actionedBy, query, serviceLocationId)
		if err != nil {
			slog.Error(err.Error())
			return 0, ErrInternal
		}
	}

	status := mapApiReservationStatusToAppointment(res.Status)
	if status == "" {
		status = "PENDING"
	}

	const insertQuery = `
	INSERT INTO appointment (
		id,
		service_location_id,
		actioned_by,
		customer_name,
		customer_phone,
		appointment_at,
		status
	)
	SELECT
		COALESCE(MAX(id), 0) + 1,
		$1, $2, $3, $4, $5, $6
	FROM appointment
	RETURNING id
	`

	var newId int32
	err = pdb.Db.Get(&newId, insertQuery,
		serviceLocationId,
		actionedBy,
		res.CustomerName,
		res.CustomerPhone,
		res.Datetime,
		status,
	)
	if err != nil {
		slog.Error(err.Error())
		return 0, ErrInternal
	}

	return newId, nil
}

func (pdb PostgresDb) UpdateReservation(id int32, res reservation.ReservationUpdate) error {
	var serviceLocationId *int32
	if res.ServiceId != nil {
		serviceId, err := strconv.ParseInt(strings.TrimSpace(*res.ServiceId), 10, 32)
		if err != nil {
			return ErrInternal
		}

		const query = `
		SELECT id
		FROM service_location
		WHERE service_id = $1
		ORDER BY id
		LIMIT 1
		`
		var slId int32
		err = pdb.Db.Get(&slId, query, int32(serviceId))
		if err != nil {
			slog.Error(err.Error())
			return ErrInternal
		}
		serviceLocationId = &slId
	}

	var actionedBy *int32
	if res.StaffId != nil {
		staffIdStr := strings.TrimSpace(*res.StaffId)
		if staffIdStr != "" && !strings.EqualFold(staffIdStr, "anyone") {
			staffId, err := strconv.ParseInt(staffIdStr, 10, 32)
			if err != nil {
				return ErrInternal
			}
			empId := int32(staffId)
			actionedBy = &empId
		} else {
			// If "anyone" (or blank) is requested, pick an employee that can perform the current/new service.
			finalServiceLocationId := int32(0)
			if serviceLocationId != nil {
				finalServiceLocationId = *serviceLocationId
			} else {
				const query = `
				SELECT service_location_id
				FROM appointment
				WHERE id = $1
				LIMIT 1
				`
				if err := pdb.Db.Get(&finalServiceLocationId, query, id); err != nil {
					slog.Error(err.Error())
					return ErrInternal
				}
			}

			const pickQuery = `
			SELECT employee_id
			FROM service_employee
			WHERE service_location_id = $1
			ORDER BY employee_id
			LIMIT 1
			`
			var empId int32
			if err := pdb.Db.Get(&empId, pickQuery, finalServiceLocationId); err != nil {
				slog.Error(err.Error())
				return ErrInternal
			}
			actionedBy = &empId
		}
	}

	var status *string
	if res.Status != nil {
		mapped := mapApiReservationStatusToAppointment(*res.Status)
		if mapped == "" {
			return ErrInternal
		}
		status = &mapped
	}

	query := `
	UPDATE appointment
	SET
		service_location_id = COALESCE($2, service_location_id),
		actioned_by         = COALESCE($3, actioned_by),
		customer_name       = COALESCE($4, customer_name),
		customer_phone      = COALESCE($5, customer_phone),
		appointment_at      = COALESCE($6, appointment_at),
		status 		        = COALESCE($7::appointment_status, status)
	WHERE id = $1
	`

	_, err := pdb.Db.Exec(query,
		id,
		serviceLocationId,
		actionedBy,
		res.CustomerName,
		res.CustomerPhone,
		res.Datetime,
		status,
	)
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}

	return nil
}

// -------------------------------------------------------------------------------------------------
// payment.OrderTotalProvider implementation -------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetOrderTotal(orderID int64) (int64, string, error) {
	const query = `
	SELECT 
		CAST(ROUND(total) AS BIGINT) AS total_cents,
		currency
	FROM order_detail
	WHERE id = $1
	LIMIT 1
	`

	var row struct {
		TotalCents int64  `db:"total_cents"`
		Currency   string `db:"currency"`
	}

	err := pdb.Db.Get(&row, query, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, "", payment.ErrInternal
		}
		slog.Error(err.Error())
		return 0, "", payment.ErrInternal
	}

	return row.TotalCents, strings.ToLower(row.Currency), nil
}

func (pdb PostgresDb) GetOrderItemsForPayment(orderID int64) ([]payment.OrderItem, error) {
	const query = `
	SELECT 
		CONCAT(item.name, 
			CASE 
				WHEN COUNT(iv.name) > 0 
				THEN CONCAT(' (', STRING_AGG(iv.name, ', '), ')') 
				ELSE '' 
			END
		) AS name,
		oi.quantity,
		CAST(GREATEST(ROUND(
			(item.price_per_unit + COALESCE(SUM(iv.price_difference), 0) - oi.discount)
		), 0) AS BIGINT) AS price_cents
	FROM order_item oi
	JOIN item ON oi.item_id = item.id
	LEFT JOIN order_item_variation oiv ON oiv.order_item_id = oi.id
	LEFT JOIN item_variation iv ON oiv.variation_id = iv.id
	WHERE oi.order_id = $1
	GROUP BY oi.id, item.name, item.price_per_unit, oi.quantity, oi.discount
	ORDER BY oi.id
	`

	var rows []struct {
		Name       string `db:"name"`
		Quantity   int    `db:"quantity"`
		PriceCents int64  `db:"price_cents"`
	}

	err := pdb.Db.Select(&rows, query, orderID)
	if err != nil {
		slog.Error("Failed to get order items for payment", "error", err, "order_id", orderID)
		return nil, ErrInternal
	}

	items := make([]payment.OrderItem, len(rows))
	for i, row := range rows {
		items[i] = payment.OrderItem{
			Name:     row.Name,
			Quantity: row.Quantity,
			Price:    row.PriceCents,
		}
	}

	return items, nil
}

func (pdb PostgresDb) GetReservationTotal(reservationID int32) (int64, string, error) {
	const query = `
	SELECT 
		CAST(ROUND(sl.price) AS BIGINT) AS total_cents,
		c.currency
	FROM appointment a
	JOIN service_location sl
		ON a.service_location_id = sl.id
	JOIN location l
		ON sl.location_id = l.id
	JOIN country c
		ON l.country_code = c.code
	WHERE a.id = $1
	`

	var row struct {
		TotalCents int64  `db:"total_cents"`
		Currency   string `db:"currency"`
	}

	err := pdb.Db.Get(&row, query, reservationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, "", payment.ErrInternal
		}
		slog.Error(err.Error())
		return 0, "", payment.ErrInternal
	}

	return row.TotalCents, strings.ToLower(row.Currency), nil
}

// GetReservationItemsForPayment returns reservation items formatted for the payment service
func (pdb PostgresDb) GetReservationItemsForPayment(reservationID int32) ([]payment.OrderItem, error) {
	const query = `
	SELECT 
		s.name AS name,
		1 AS quantity,
		CAST(ROUND(sl.price) AS BIGINT) AS price_cents
	FROM appointment a
	JOIN service_location sl
		ON a.service_location_id = sl.id
	JOIN service s
		ON sl.service_id = s.id
	WHERE a.id = $1
	LIMIT 1
	`

	var row struct {
		Name       string `db:"name"`
		Quantity   int    `db:"quantity"`
		PriceCents int64  `db:"price_cents"`
	}

	err := pdb.Db.Get(&row, query, reservationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return []payment.OrderItem{}, nil
		}
		slog.Error("Failed to get reservation items for payment", "error", err, "reservation_id", reservationID)
		return nil, ErrInternal
	}

	return []payment.OrderItem{
		{
			Name:     row.Name,
			Quantity: row.Quantity,
			Price:    row.PriceCents,
		},
	}, nil
}

func (pdb PostgresDb) MarkReservationCompleted(reservationID int32) error {
	const query = `
	UPDATE appointment
	SET status = 'COMPLETED'
	WHERE id = $1
	`

	res, err := pdb.Db.Exec(query, reservationID)
	if err != nil {
		slog.Error("Failed to mark reservation as completed", "error", err, "reservation_id", reservationID)
		return ErrInternal
	}

	_, _ = res.RowsAffected()

	return nil
}

// -------------------------------------------------------------------------------------------------
// payment.PaymentRepo implementation --------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) CreatePayment(pmt payment.Payment) (int64, error) {
	const query = `
	INSERT INTO payment (order_id, amount, currency, payment_method, stripe_session_id, stripe_payment_intent_id, status)
	VALUES ($1, $2, $3::currency, $4::payment_method, $5, $6, $7::payment_status)
	RETURNING id
	`

	var paymentID int64
	err := pdb.Db.QueryRow(
		query,
		pmt.OrderID,
		pmt.AmountCents,
		strings.ToUpper(pmt.Currency),
		strings.ToUpper(pmt.PaymentMethod),
		pmt.StripeSessionID,
		pmt.StripePaymentIntentID,
		strings.ToUpper(pmt.Status),
	).Scan(&paymentID)

	if err != nil {
		slog.Error("Failed to create payment", "error", err)
		return 0, ErrInternal
	}

	return paymentID, nil
}

func (pdb PostgresDb) UpdatePaymentStatus(sessionID string, status string) error {
	const query = `
	UPDATE payment
	SET status = $1::payment_status, updated_at = CURRENT_TIMESTAMP
	WHERE stripe_session_id = $2
	`

	result, err := pdb.Db.Exec(query, strings.ToUpper(status), sessionID)
	if err != nil {
		slog.Error("Failed to update payment status", "error", err, "session_id", sessionID)
		return ErrInternal
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		slog.Error("Failed to check rows affected", "error", err)
		return ErrInternal
	}

	if rowsAffected == 0 {
		return payment.ErrPaymentNotFound
	}

	return nil
}

func (pdb PostgresDb) UpdatePaymentIntentID(sessionID string, paymentIntentID string) error {
	const query = `
	UPDATE payment
	SET stripe_payment_intent_id = $1, updated_at = CURRENT_TIMESTAMP
	WHERE stripe_session_id = $2
	`

	result, err := pdb.Db.Exec(query, paymentIntentID, sessionID)
	if err != nil {
		slog.Error("Failed to update payment intent ID", "error", err, "session_id", sessionID)
		return ErrInternal
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		slog.Error("Failed to check rows affected", "error", err)
		return ErrInternal
	}

	if rowsAffected == 0 {
		return payment.ErrPaymentNotFound
	}

	return nil
}

func (pdb PostgresDb) GetPaymentBySessionID(sessionID string) (*payment.Payment, error) {
	const query = `
	SELECT id, order_id, amount, currency, payment_method, stripe_session_id, stripe_payment_intent_id, status, created_at, updated_at
	FROM payment
	WHERE stripe_session_id = $1
	LIMIT 1
	`

	var pmt payment.Payment
	err := pdb.Db.Get(&pmt, query, sessionID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, payment.ErrPaymentNotFound
		}
		slog.Error("Failed to get payment by session ID", "error", err, "session_id", sessionID)
		return nil, ErrInternal
	}

	// Convert enum values to lowercase for consistency with JSON responses
	pmt.Status = strings.ToLower(pmt.Status)
	pmt.PaymentMethod = strings.ToLower(pmt.PaymentMethod)
	pmt.Currency = strings.ToLower(pmt.Currency)

	return &pmt, nil
}

func (pdb PostgresDb) GetPaymentByOrderID(orderID int64) (*payment.Payment, error) {
	const query = `
	SELECT id, order_id, amount, currency, payment_method, stripe_session_id, stripe_payment_intent_id, status, created_at, updated_at
	FROM payment
	WHERE order_id = $1
	ORDER BY created_at DESC
	LIMIT 1
	`

	var pmt payment.Payment
	err := pdb.Db.Get(&pmt, query, orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, payment.ErrPaymentNotFound
		}
		slog.Error("Failed to get payment by order ID", "error", err, "order_id", orderID)
		return nil, ErrInternal
	}

	// Convert enum values to lowercase for consistency with JSON responses
	pmt.Status = strings.ToLower(pmt.Status)
	pmt.PaymentMethod = strings.ToLower(pmt.PaymentMethod)
	pmt.Currency = strings.ToLower(pmt.Currency)

	return &pmt, nil
}

func (pdb PostgresDb) GetPaymentByPaymentIntentID(paymentIntentID string) (*payment.Payment, error) {
	const query = `
	SELECT id, order_id, amount, currency, payment_method, stripe_session_id, stripe_payment_intent_id, status, created_at, updated_at
	FROM payment
	WHERE stripe_payment_intent_id = $1
	LIMIT 1
	`

	var pmt payment.Payment
	err := pdb.Db.Get(&pmt, query, paymentIntentID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, payment.ErrPaymentNotFound
		}
		slog.Error("Failed to get payment by payment intent ID", "error", err, "payment_intent_id", paymentIntentID)
		return nil, ErrInternal
	}

	// Convert enum values to lowercase for consistency with JSON responses
	pmt.Status = strings.ToLower(pmt.Status)
	pmt.PaymentMethod = strings.ToLower(pmt.PaymentMethod)
	pmt.Currency = strings.ToLower(pmt.Currency)

	return &pmt, nil
}

// -------------------------------------------------------------------------------------------------
// reservation.ServiceRepo implementation ----------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetServices() ([]reservation.Service, error) {
	const query = `
	SELECT
		s.id            AS service_id,
		s.name          AS service_name,
		s.duration_mins AS duration_mins,
		MIN(sl.price)   AS price
	FROM service s
	JOIN service_location sl
		ON sl.service_id = s.id
	GROUP BY s.id, s.name, s.duration_mins
	ORDER BY s.id
	`

	rows := []struct {
		ServiceId int32  `db:"service_id"`
		Name      string `db:"service_name"`
		Duration  int    `db:"duration_mins"`
		Price     int64  `db:"price"`
	}{}

	err := pdb.Db.Select(&rows, query)
	if err != nil {
		slog.Error(err.Error())
		return []reservation.Service{}, ErrInternal
	}

	services := make([]reservation.Service, 0, len(rows))
	for _, row := range rows {
		services = append(services, reservation.Service{
			Id:       strconv.FormatInt(int64(row.ServiceId), 10),
			Name:     row.Name,
			NameKey:  row.Name,
			Duration: row.Duration,
			Price:    int(row.Price),
		})
	}

	return services, nil
}

// -------------------------------------------------------------------------------------------------
// reservation.StaffRepo implementation ------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetStaff() ([]reservation.Staff, error) {
	const query = `
	WITH roles AS (
		SELECT 
			er.employee_id,
			MIN(r.name) AS role_name
		FROM employee_role er
		JOIN role r
			ON er.role_id = r.id
		GROUP BY er.employee_id
	)
	SELECT
		e.id,
		e.first_name,
		e.last_name,
		COALESCE(roles.role_name, '') AS role_name,
		ARRAY_AGG(DISTINCT sl.service_id) AS service_ids
	FROM employee e
	JOIN service_employee se
		ON e.id = se.employee_id
	JOIN service_location sl
		ON se.service_location_id = sl.id
	LEFT JOIN roles
		ON roles.employee_id = e.id
	GROUP BY e.id, e.first_name, e.last_name, roles.role_name
	ORDER BY e.id
	`

	rows := []struct {
		Id         int32         `db:"id"`
		FirstName  string        `db:"first_name"`
		LastName   string        `db:"last_name"`
		RoleName   string        `db:"role_name"`
		ServiceIds pq.Int64Array `db:"service_ids"`
	}{}

	err := pdb.Db.Select(&rows, query)
	if err != nil {
		slog.Error(err.Error())
		return []reservation.Staff{}, ErrInternal
	}

	serviceSet := map[string]struct{}{}
	staff := make([]reservation.Staff, 0, len(rows)+1)

	for _, row := range rows {
		serviceIds := make([]string, len(row.ServiceIds))
		for i, id := range row.ServiceIds {
			serviceIds[i] = strconv.FormatInt(id, 10)
			serviceSet[serviceIds[i]] = struct{}{}
		}

		role := row.RoleName
		if role == "" {
			role = "Staff"
		}

		staff = append(staff, reservation.Staff{
			Id:       strconv.FormatInt(int64(row.Id), 10),
			Name:     strings.TrimSpace(fmt.Sprintf("%s %s", row.FirstName, row.LastName)),
			Role:     role,
			Services: serviceIds,
		})
	}

	if len(serviceSet) > 0 {
		allServices := make([]string, 0, len(serviceSet))
		for id := range serviceSet {
			allServices = append(allServices, id)
		}
		sort.Strings(allServices)

		staff = append([]reservation.Staff{
			{
				Id:       "anyone",
				Name:     "Anyone",
				Role:     "Any",
				Services: allServices,
			},
		}, staff...)
	}

	return staff, nil
}

// -------------------------------------------------------------------------------------------------
// Reservation helpers -----------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func mapAppointmentStatusToApi(status string) string {
	switch strings.ToUpper(status) {
	case "PENDING", "RESERVED":
		return "pending"
	case "SERVING":
		return "confirmed"
	case "COMPLETED", "PAID":
		return "completed"
	case "CANCELLED", "CANCELED":
		return "cancelled"
	case "REFUND_PENDING":
		return "refund_pending"
	case "REFUNDED":
		return "refunded"
	default:
		return strings.ToLower(status)
	}
}

func mapApiReservationStatusToAppointment(status string) string {
	trimmed := strings.TrimSpace(status)
	if trimmed == "" {
		return ""
	}

	upper := strings.ToUpper(trimmed)
	switch upper {
	// Accept DB enum values directly.
	case "PENDING", "COMPLETED", "CANCELLED", "REFUND_PENDING", "REFUNDED":
		return upper

	// API / UI values (and common variants).
	case "CONFIRMED":
		return "PENDING"
	case "CANCELED":
		return "CANCELLED"

	// Legacy values from older appointment_status enums.
	case "RESERVED", "SERVING":
		return "PENDING"
	case "PAID":
		return "COMPLETED"
	}

	return ""
}

// -------------------------------------------------------------------------------------------------
// reservation.ReservationRepo - Refund methods ---------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) CreateReservationRefundRequest(reservationId int32, refundData reservation.RefundData) error {
	transaction, err := pdb.Db.Beginx()
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}

	{
		const appointmentStatusStatement = `
		UPDATE appointment
		SET status = 'REFUND_PENDING'
		WHERE
			id = $1
			AND status = 'COMPLETED'
		`

		res, err := transaction.Exec(appointmentStatusStatement, reservationId)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
		rows, err := res.RowsAffected()
		if err != nil {
			slog.Error("error checking rows affected when setting reservation refund pending", "error", err)
			_ = transaction.Rollback()
			return ErrInternal
		}
		if rows != 1 {
			slog.Warn("reservation not updated - might already be in REFUND_PENDING status", "rows", rows, "reservation_id", reservationId)
			_ = transaction.Rollback()
			return nil
		}
	}
	{
		const refundDataStatement = `
		INSERT INTO reservation_refund_data (appointment_id, name, phone, email, reason)
			VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (appointment_id) DO NOTHING
		`

		_, err = transaction.Exec(
			refundDataStatement,
			reservationId,
			refundData.Name,
			refundData.Phone,
			refundData.Email,
			refundData.Reason,
		)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
	}

	_ = transaction.Commit()

	return nil
}

// Prob will delete, needed for testing
func (pdb PostgresDb) CancelReservationRefundRequest(reservationId int32) error {
	transaction, err := pdb.Db.Beginx()
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}

	{
		const appointmentStatusStatement = `
		UPDATE appointment
		SET status = 'COMPLETED'
		WHERE
			id = $1
			AND status = 'REFUND_PENDING'
		`

		res, err := transaction.Exec(appointmentStatusStatement, reservationId)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
		rows, err := res.RowsAffected()
		if err != nil || rows != 1 {
			slog.Error("unexpected rows affected when canceling reservation refund", "rows", rows, "error", err)
			_ = transaction.Rollback()
			return ErrInternal
		}
	}
	{
		const deleteRefundDataStatement = `
		DELETE FROM reservation_refund_data WHERE appointment_id = $1
		`

		_, err = transaction.Exec(deleteRefundDataStatement, reservationId)
		if err != nil {
			slog.Error(err.Error())
			_ = transaction.Rollback()
			return ErrInternal
		}
	}

	_ = transaction.Commit()

	return nil
}
