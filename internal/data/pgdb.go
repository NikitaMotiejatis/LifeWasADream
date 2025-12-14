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
	ORDER BY
		id DESC
	`

	orders := []order.OrderSummary{}
	err := pdb.Db.Select(&orders, query, filter.OrderStatus, filter.From, filter.To)
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

func (pdb PostgresDb) CreateOrder(order order.Order) (int64, error) {
	createOrderStatement := `
	INSERT INTO order_data (employee_id, currency)
		VALUES (1, 'EUR')
		RETURNING id
	`

	orderId := int64(-1)
	err := pdb.Db.QueryRow(createOrderStatement).Scan(&orderId)
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

	transaction, err := pdb.Db.Begin()
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
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

func (pdb PostgresDb) GetOrderItems(orderId int64) ([]order.Item, error) {
	const query = `
	SELECT id, item_id, quantity
	FROM order_item
	WHERE order_id = $1
	`
	var itemsDetails []struct {
		Id			int64 	`db:"id"`
		ItemId		int64 	`db:"item_id"`
		Quantity	uint16	`db:"quantity"`
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

		const selectedVariationQuery =`
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
	if filter.Category == nil {
		filter.Category = new(string)
	}

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
			AND ($1 = '' OR category.name = $1)
		ORDER BY
			item.name ASC
		`

		err := pdb.Db.Select(&filteredProducts, query, *filter.Category)
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
		a.appointment_at DESC
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
		case "no_show":
			counts.NoShow += row.Count
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

func (pdb PostgresDb) CreateReservation(res reservation.ReservationCreate) (int32, error) {
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
	if staffId, err := strconv.ParseInt(res.StaffId, 10, 32); err == nil {
		actionedBy = int32(staffId)
	} else {
		const query = `
		SELECT employee_id
		FROM service_employee se
		JOIN service_location sl
			ON se.service_location_id = sl.id
		WHERE sl.service_id = $1
		ORDER BY employee_id
		LIMIT 1
		`
		err := pdb.Db.Get(&actionedBy, query, serviceId)
		if err != nil {
			slog.Error(err.Error())
			return 0, ErrInternal
		}
	}

	status := mapApiReservationStatusToAppointment(res.Status)
	if status == "" {
		status = "RESERVED"
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
	setParts := []string{}
	args := []any{}

	if res.CustomerName != nil {
		setParts = append(setParts, fmt.Sprintf("customer_name = $%d", len(args)+1))
		args = append(args, *res.CustomerName)
	}
	if res.CustomerPhone != nil {
		setParts = append(setParts, fmt.Sprintf("customer_phone = $%d", len(args)+1))
		args = append(args, *res.CustomerPhone)
	}
	if res.Datetime != nil {
		setParts = append(setParts, fmt.Sprintf("appointment_at = $%d", len(args)+1))
		args = append(args, *res.Datetime)
	}
	if res.Status != nil {
		status := mapApiReservationStatusToAppointment(*res.Status)
		if status != "" {
			setParts = append(setParts, fmt.Sprintf("status = $%d", len(args)+1))
			args = append(args, status)
		}
	}
	if res.ServiceId != nil {
		if serviceId, err := strconv.ParseInt(*res.ServiceId, 10, 32); err == nil {
			// update service location to first matching for service
			var serviceLocationId int32
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
				return ErrInternal
			}
			setParts = append(setParts, fmt.Sprintf("service_location_id = $%d", len(args)+1))
			args = append(args, serviceLocationId)
		}
	}
	if res.StaffId != nil {
		if staffId, err := strconv.ParseInt(*res.StaffId, 10, 32); err == nil {
			setParts = append(setParts, fmt.Sprintf("actioned_by = $%d", len(args)+1))
			args = append(args, int32(staffId))
		}
	}

	if len(setParts) == 0 {
		return nil
	}

	args = append(args, id)

	query := fmt.Sprintf(`
	UPDATE appointment
	SET %s
	WHERE id = $%d
	`, strings.Join(setParts, ", "), len(args))

	_, err := pdb.Db.Exec(query, args...)
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

// -------------------------------------------------------------------------------------------------
// order mutations ---------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) CreateOrder(o order.Order) (int64, error) {
	// Default metadata
	const defaultEmployeeId = int32(10)
	const defaultCurrency = "USD"

	tx, err := pdb.Db.Beginx()
	if err != nil {
		slog.Error(err.Error())
		return 0, ErrInternal
	}
	defer func() {
		_ = tx.Rollback()
	}()

	var orderId int64
	{
		const insertOrder = `
		INSERT INTO order_data (
			id, employee_id, currency, discount, tip, service_charge
		)
		SELECT COALESCE(MAX(id), 0) + 1, $1, $2, 0, 0, 0
		FROM order_data
		RETURNING id
		`
		if err := tx.Get(&orderId, insertOrder, defaultEmployeeId, defaultCurrency); err != nil {
			slog.Error(err.Error())
			return 0, ErrInternal
		}
	}

	// insert items
	for _, item := range o.Items {
		itemId := int64(item.Product.Id)
		if itemId == 0 {
			slog.Error("missing product id on item")
			return 0, ErrInternal
		}

		var orderItemId int64
		{
			const insertItem = `
			INSERT INTO order_item (id, order_id, item_id, quantity, discount)
			SELECT COALESCE(MAX(id), 0) + 1, $1, $2, $3, 0
			FROM order_item
			RETURNING id
			`
			if err := tx.Get(&orderItemId, insertItem, orderId, itemId, item.Quantity); err != nil {
				slog.Error(err.Error())
				return 0, ErrInternal
			}
		}

		// variations: link by name+item_id
		if len(item.SelectedVariations) > 0 {
			for _, v := range item.SelectedVariations {
				var variationId int64
				const findVariation = `
				SELECT id
				FROM item_variation
				WHERE item_id = $1 AND name = $2
				LIMIT 1
				`
				if err := tx.Get(&variationId, findVariation, itemId, v.Name); err != nil {
					slog.Error(err.Error())
					return 0, ErrInternal
				}

				const insertItemVariation = `
				INSERT INTO order_item_variation (order_item_id, variation_id)
				VALUES ($1, $2)
				ON CONFLICT DO NOTHING
				`
				if _, err := tx.Exec(insertItemVariation, orderItemId, variationId); err != nil {
					slog.Error(err.Error())
					return 0, ErrInternal
				}
			}
		}
	}

	if err := tx.Commit(); err != nil {
		slog.Error(err.Error())
		return 0, ErrInternal
	}

	return orderId, nil
}

func (pdb PostgresDb) UpdateOrder(orderId int32, o order.Order) error {
	// Simplified: replace items by deleting and reinserting.
	tx, err := pdb.Db.Beginx()
	if err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}
	defer func() {
		_ = tx.Rollback()
	}()

	// delete variations first due to FK
	{
		const deleteVariations = `
		DELETE FROM order_item_variation
		WHERE order_item_id IN (SELECT id FROM order_item WHERE order_id = $1)
		`
		if _, err := tx.Exec(deleteVariations, orderId); err != nil {
			slog.Error(err.Error())
			return ErrInternal
		}
	}
	{
		const deleteItems = `
		DELETE FROM order_item WHERE order_id = $1
		`
		if _, err := tx.Exec(deleteItems, orderId); err != nil {
			slog.Error(err.Error())
			return ErrInternal
		}
	}

	for _, item := range o.Items {
		itemId := int64(item.Product.Id)
		if itemId == 0 {
			slog.Error("missing product id on item")
			return ErrInternal
		}

		var orderItemId int64
		const insertItem = `
		INSERT INTO order_item (id, order_id, item_id, quantity, discount)
		SELECT COALESCE(MAX(id), 0) + 1, $1, $2, $3, 0
		FROM order_item
		RETURNING id
		`
		if err := tx.Get(&orderItemId, insertItem, orderId, itemId, item.Quantity); err != nil {
			slog.Error(err.Error())
			return ErrInternal
		}

		for _, v := range item.SelectedVariations {
			var variationId int64
			const findVariation = `
			SELECT id
			FROM item_variation
			WHERE item_id = $1 AND name = $2
			LIMIT 1
			`
			if err := tx.Get(&variationId, findVariation, itemId, v.Name); err != nil {
				slog.Error(err.Error())
				return ErrInternal
			}

			const insertItemVariation = `
			INSERT INTO order_item_variation (order_item_id, variation_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING
			`
			if _, err := tx.Exec(insertItemVariation, orderItemId, variationId); err != nil {
				slog.Error(err.Error())
				return ErrInternal
			}
		}
	}

	if err := tx.Commit(); err != nil {
		slog.Error(err.Error())
		return ErrInternal
	}

	return nil
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
	case "RESERVED":
		return "pending"
	case "SERVING":
		return "confirmed"
	case "PAID":
		return "completed"
	case "CANCELLED":
		return "cancelled"
	default:
		return strings.ToLower(status)
	}
}

func mapApiReservationStatusToAppointment(status string) string {
	switch strings.ToLower(status) {
	case "pending":
		return "RESERVED"
	case "confirmed":
		return "SERVING"
	case "completed":
		return "PAID"
	case "cancelled", "canceled":
		return "CANCELLED"
	default:
		return ""
	}
}
