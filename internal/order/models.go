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
