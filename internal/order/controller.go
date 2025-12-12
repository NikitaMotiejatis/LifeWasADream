package order

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type OrderController struct {
	OrderRepo	OrderRepo
	ProductRepo	ProductRepo
}

func (c OrderController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/", c.orders)
	router.Get("/counts", c.counts)
	router.Get("/products", c.getProducts)

	return router
}

func (c OrderController) orders(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	orderStatus := r.URL.Query().Get("orderStatus")

	filter := OrderFilter{}

	if orderStatus != "" && orderStatus != "all" {
		filter.OrderStatus = &orderStatus
	}

	orders, err := c.OrderRepo.GetOrders(filter)
	if err != nil {
		http.Error(w, "failed to send orders", http.StatusInternalServerError)
		return
	}

	if err = json.NewEncoder(w).Encode(orders); err != nil {
		http.Error(w, "failed to send orders", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (c OrderController) counts(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	counts, err := c.OrderRepo.GetOrderCounts()
	if err != nil {
		http.Error(w, "failed to count orders", http.StatusInternalServerError)
		return
	}

	if err = json.NewEncoder(w).Encode(counts); err != nil {
		http.Error(w, "failed to count orders", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
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
