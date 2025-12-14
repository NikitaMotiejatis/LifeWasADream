package order

import "time"

type Order struct {
	Items		[]Item `json:"items"`
}

type OrderSummary struct {
	Id			int32		`json:"id"        db:"id"`
	Total 		float64		`json:"total"     db:"total"`
	CreatedAt	time.Time	`json:"createdAt" db:"created_at"`
	Status		string		`json:"status"    db:"status"`
}

type Variation struct {
	Name          string	`json:"name"          db:"name"`
	PriceModifier uint64	`json:"priceModifier" db:"price_difference"`
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
