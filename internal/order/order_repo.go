package order

type OrderRepo interface {
	GetOrders(filter OrderFilter) ([]Order, error)
}

// Options for filtering orders.
// If a filter field should be ignored, it should be set to nil pointer.
type OrderFilter struct {
	OrderStatus	*string
}
