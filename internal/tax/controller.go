package tax

import (
	"dreampos/internal/order"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type TaxController struct {
	ProductRepo order.ProductRepo
}

func (c TaxController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/", c.getProductInfo)
	router.Get("/default", c.getDefaultVat)

	return router
}

func (c TaxController) getProductInfo(w http.ResponseWriter, r *http.Request) {
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

func (c TaxController) getDefaultVat(w http.ResponseWriter, r *http.Request) {
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
