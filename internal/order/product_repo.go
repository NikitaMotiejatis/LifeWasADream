package order

type ProductRepo interface {
	GetProducts(filter ProductFilter) ([]Product, error)
	GetDefaultVat(locationId int64) (float64, error)
}

// Options for filtering products.
// If a filter field should be ignored, it should be set to nil pointer.
type ProductFilter struct {
	LocationId	int64
	Category	*string
	Includes	*string
}
