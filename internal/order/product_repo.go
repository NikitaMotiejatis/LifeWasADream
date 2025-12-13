package order

type ProductRepo interface {
	GetProducts(filter ProductFilter) ([]Product, error)
}

// Options for filtering products.
// If a filter field should be ignored, it should be set to nil pointer.
type ProductFilter struct {
	Category	*string
	Includes	*string
}
