package order

import "time"

type OrderRepo interface {
	GetOrders(filter OrderFilter) ([]OrderSummary, error)
	GetOrderCounts(filter OrderFilter) (OrderCounts, error)
	GetOrderItems(orderId int32) ([]Item, error)
}

// Options for filtering orders.
// If a filter field should be ignored, it should be set to nil pointer.
type OrderFilter struct {
	OrderStatus	*string		`db:"order_status"`
	From		*time.Time	`db:"from"`
	To			*time.Time	`db:"to"`
}
