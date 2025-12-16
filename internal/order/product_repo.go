package order

type ProductRepo interface {
	GetProducts(filter ProductFilter) ([]Product, error)
	GetCategories(locationId int64) ([]string, error)
	GetDefaultVat(locationId int64) (int64, error)
	SetVat(locationId int64, itemId int64, newVat int64) error
}

// Options for filtering products.
// If a filter field should be ignored, it should be set to nil pointer.
type ProductFilter struct {
	LocationId	int64
	Category	*string
	Includes	*string
}
