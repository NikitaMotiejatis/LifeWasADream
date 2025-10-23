package order

import (
	"database/sql"
	"log/slog"
)

type OrderService interface {
	ListOrders(db *sql.DB) ([]Order, error)
	GetOrder(db *sql.DB, orderId int64) (*Order, error)
}

type ProductionOrderService struct {
}

func (service ProductionOrderService) ListOrders(db *sql.DB) ([]Order, error) {
	rows, err := db.Query("SELECT * FROM orders;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := []Order{}
	for rows.Next() {
		var nextOrder Order
		err := rows.Scan(&nextOrder.Id, &nextOrder.Details)
		if err != nil {
			slog.Warn("Failed to read order: " + err.Error())
		}
		orders = append(orders, nextOrder)
	}

	return orders, nil
}


func (service ProductionOrderService) GetOrder(db *sql.DB, orderId int64) (*Order, error) {
	rows, err := db.Query("SELECT * FROM orders WHERE id = ?;", orderId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil
	}

	var order Order
	err = rows.Scan(&order.Id, &order.Details)
	if err != nil {
		slog.Warn("Failed to read order: " + err.Error())
		return nil, nil
	}

	if rows.Next() {
		slog.Warn(
			"More than one order with the same id",
			"ID", orderId,
		)
		return nil, nil
	}

	return &order, nil
}
