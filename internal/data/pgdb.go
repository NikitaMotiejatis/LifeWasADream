package data

import (
	"fmt"
	"log/slog"
	"strings"

	"github.com/jmoiron/sqlx"

	"dreampos/internal/auth"
	"dreampos/internal/config"
	"dreampos/internal/order"
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

		var user struct{
			Id				int32	`db:"id"`
			PasswordHash 	string 	`db:"password_hash"`
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

func (pdb PostgresDb) GetOrderCounts(filter order.OrderFilter) (order.OrderCounts, error) {
	return order.OrderCounts{}, nil
	//counts := order.OrderCounts{}
	//for _, o := range s.Orders {
	//	if filter.From != nil && o.CreatedAt.Before(*filter.From) {
	//		continue
	//	}
	//	if filter.To != nil && o.CreatedAt.After(*filter.To) {
	//		continue
	//	}

	//	counts.All += 1
	//	switch o.Status {
	//	case "open": 			counts.Open += 1
	//	case "closed": 			counts.Closed += 1
	//	case "refund_pending": 	counts.RefundPending += 1
	//	case "refunded": 		counts.Refunded += 1
	//	}
	//}

	//return counts, nil
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

		const productQuery =`
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
