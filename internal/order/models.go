package order

import "time"

type Order struct {
	Items		[]Item `json:"items"`
}

type OrderSummary struct {
	Id			uint32		`json:"id"`
	Total 		float64		`json:"total"`
	CreatedAt	time.Time	`json:"createdAt"`
	Status		string		`json:"status"`
}

type Variation struct {
	Name          string	`json:"name"`
	PriceModifier uint64	`json:"priceModifier"`
}

type Product struct {
	Id         int32		`json:"id"         db:"id"`
	Name       string		`json:"name"       db:"name"`
	BasePrice  int64     	`json:"basePrice"  db:"price_per_unit"`
	Categories []string		`json:"categories"`
	Variations []Variation	`json:"variations"`
}

type OrderCounts struct {
	All				uint64	`json:"all"`
	Open			uint64	`json:"open"`
	Closed			uint64	`json:"closed"`
	RefundPending	uint64	`json:"refund_pending"`
	Refunded		uint64	`json:"refunded"`
}

type Item struct {
	Product				Product		`json:"product"`
	SelectedVariations	[]Variation	`json:"selectedVariations"`
	Quantity			uint16		`json:"quantity"`
}
