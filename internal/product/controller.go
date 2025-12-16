package product

import (
	"dreampos/internal/order"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type ProductController struct {
	ProductRepo order.ProductRepo
}

func (c ProductController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/", c.getProductInfo)
	router.Get("/category", c.getCategories)
	router.Get("/tax/default", c.getDefaultVat)
	router.Patch("/tax", c.setVat)

	return router
}

func (c ProductController) getProductInfo(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	locationId, err := strconv.ParseInt(r.URL.Query().Get("locationId"), 10, 64)
	if err != nil {
		http.Error(w, "bad or no location id", http.StatusBadRequest)
		return
	}

	category := new(string)
	*category = r.URL.Query().Get("category")
	if *category == "" || *category == "all" {
		category = nil
	}

	defaultVat, err := c.ProductRepo.GetProducts(order.ProductFilter{
		LocationId: locationId,
		Category:   category,
	})
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	if err = json.NewEncoder(w).Encode(defaultVat); err != nil {
		http.Error(w, "failed to send products", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func (c ProductController) getCategories(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	locationId, err := strconv.ParseInt(r.URL.Query().Get("locationId"), 10, 64)
	if err != nil {
		http.Error(w, "bad or no location id", http.StatusBadRequest)
		return
	}

	categories, err := c.ProductRepo.GetCategories(locationId)
	if err != nil {
		http.Error(w, "failed to get categories", http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(categories); err != nil {
		http.Error(w, "failed to get categories", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func (c ProductController) getDefaultVat(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	locationId, err := strconv.ParseInt(r.URL.Query().Get("locationId"), 10, 64)
	if err != nil {
		http.Error(w, "bad or no location id", http.StatusBadRequest)
		return
	}

	defaultVat, err := c.ProductRepo.GetDefaultVat(locationId)
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	if err = json.NewEncoder(w).Encode(defaultVat); err != nil {
		http.Error(w, "failed to send default vat", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func (c ProductController) setVat(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	locationId, err := strconv.ParseInt(r.URL.Query().Get("locationId"), 10, 64)
	if err != nil {
		http.Error(w, "bad or no location id", http.StatusBadRequest)
		return
	}

	var params struct {
		ItemId	int64 `json:"id"`
		NewVat	int64 `json:"vat"`
	}
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = c.ProductRepo.SetVat(locationId, params.ItemId, params.NewVat)
	if err != nil {
		http.Error(w, "failed to set vat", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
