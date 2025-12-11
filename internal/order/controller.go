package order

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type OrderController struct {
	ProductRepo	ProductRepo
}

func (c OrderController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/products", c.getProducts)

	return router
}

func (c OrderController) getProducts(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	time.Sleep(time.Second / 2.0) // TODO: remove

	category := r.URL.Query().Get("category")
	includes := r.URL.Query().Get("includes")

	filter := ProductFilter{}
	if category != "" && category != "all" {
		filter.Category = &category
	}
	if includes != "" {
		filter.Includes = &includes // TODO: maybe some checking
	}

	products, err := c.ProductRepo.GetProducts(filter)
	if err != nil {
		http.Error(w, "failed to send products", http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(products); err != nil {
		http.Error(w, "failed to send products", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type Variation struct {
	Name          string  `json:"name"`
	NameKey       string  `json:"nameKey"`
	PriceModifier float64 `json:"priceModifier"`
}

type Product struct {
	ID         string      `json:"id"`
	Name       string      `json:"name"`
	NameKey    string      `json:"nameKey"`
	BasePrice  float64     `json:"basePrice"`
	Categories []string    `json:"categories"`
	Variations []Variation `json:"variations"`
}
