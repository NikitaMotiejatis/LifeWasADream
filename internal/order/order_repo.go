package order

import "time"

type OrderRepo interface {
	GetOrders(filter OrderFilter) ([]OrderSummary, error)
	GetOrderCounts(filter OrderFilter) (OrderCounts, error)
	CreateOrder(order Order) (int64, error)
	ModifyOrder(orderId int64, order Order) error
	GetOrderItems(orderId int64) ([]Item, error)
}

// Options for filtering orders.
// If a filter field should be ignored, it should be set to nil pointer.
type OrderFilter struct {
	OrderStatus *string    `db:"order_status"`
	From        *time.Time `db:"from"`
	To          *time.Time `db:"to"`
}
