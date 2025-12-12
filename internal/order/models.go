package order

import "time"

type Order struct {
	Id			int			`json:"id"`
	Total 		float64		`json:"total"`
	CreatedAt	time.Time	`json:"createdAt"`
	Status		string		`json:"status"`
}

type Variation struct {
	Name          string  `json:"name"`
	NameKey       string  `json:"nameKey"`
	PriceModifier float64 `json:"priceModifier"`
}

type Product struct {
	Id         string      `json:"id"`
	Name       string      `json:"name"`
	NameKey    string      `json:"nameKey"`
	BasePrice  float64     `json:"basePrice"`
	Categories []string    `json:"categories"`
	Variations []Variation `json:"variations"`
}

type OrderCounts struct {
	All				uint64 `json:"all"`
	Open			uint64 `json:"open"`
	Closed			uint64 `json:"closed"`
	RefundPending	uint64 `json:"refund_pending"`
	Refunded		uint64 `json:"refunded"`
}
