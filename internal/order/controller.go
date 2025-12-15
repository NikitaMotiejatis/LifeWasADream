package order

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type OrderController struct {
	OrderRepo   OrderRepo
	ProductRepo ProductRepo
}

func (c OrderController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/", c.orders)
	router.Post("/", c.createOrder)
	router.Post("/{orderId:^[0-9]{1,10}$}", c.createOrder)
	router.Patch("/{orderId:^[0-9]{1,10}$}", c.updateOrder)
	router.Get("/{orderId:^[0-9]{1,10}$}", c.getOrder)
	router.Post("/{orderId:^[0-9]{1,10}$}/ask-refund", c.askForRefund)
	router.Delete("/{orderId:^[0-9]{1,10}$}/ask-refund/cancel", c.cancelRefundRequest)
	router.Get("/products", c.getProducts)

	return router
}

func (c OrderController) orders(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	filter := OrderFilter{}
	{
		orderStatus := r.URL.Query().Get("orderStatus")
		if orderStatus != "" && orderStatus != "all" {
			filter.OrderStatus = &orderStatus
		}
	}
	{
		paramString := r.URL.Query().Get("from")
		if paramString != "" {
			orderFrom, err := time.Parse(time.DateOnly, paramString)
			if err != nil {
				http.Error(w, "invalid param 'from'.", http.StatusBadRequest)
				return
			}
			filter.From = &orderFrom
		}
	}
	{
		paramString := r.URL.Query().Get("to")
		if paramString != "" {
			orderTo, err := time.Parse(time.DateOnly, paramString)
			if err != nil {
				http.Error(w, "invalid param 'to'.", http.StatusBadRequest)
				return
			}
			orderTo = orderTo.Add(24 * time.Hour)
			orderTo = orderTo.Add(-1 * time.Nanosecond)
			filter.To = &orderTo
		}
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

func (c OrderController) createOrder(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	var order Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, "invalid order", http.StatusBadRequest)
		return
	}

	orderId, err := c.OrderRepo.CreateOrder(order)
	if err != nil {
		http.Error(w, "failed to create order", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	response := map[string]any{
		"id":      orderId,
		"message": "order created",
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (c OrderController) getOrder(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	orderId, err := strconv.ParseInt(r.PathValue("orderId"), 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	items, err := c.OrderRepo.GetOrderItems(orderId)
	if err != nil {
		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(items); err != nil {
		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (c OrderController) updateOrder(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	orderId, err := strconv.ParseInt(r.PathValue("orderId"), 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var order Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, "invalid order", http.StatusBadRequest)
		return
	}

	err = c.OrderRepo.ModifyOrder(orderId, order)
	if err != nil {
		http.Error(w, "failed to modify order", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]any{
		"id":      orderId,
		"message": "order updated",
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (c OrderController) askForRefund(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	orderId, err := strconv.ParseInt(r.PathValue("orderId"), 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var refundData RefundData
	if err := json.NewDecoder(r.Body).Decode(&refundData); err != nil {
		http.Error(w, "bad refund data", http.StatusBadRequest)
		return
	}

	err = c.OrderRepo.CreateRefundRequest(orderId, refundData)
	if err != nil {
		http.Error(w, "failed to create refund request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (c OrderController) cancelRefundRequest(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	orderId, err := strconv.ParseInt(r.PathValue("orderId"), 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	err = c.OrderRepo.CancelRefundRequest(orderId)
	if err != nil {
		http.Error(w, "failed to cancel refund request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (c OrderController) counts(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	filter := OrderFilter{}
	{
		paramString := r.URL.Query().Get("from")
		if paramString != "" {
			orderFrom, err := time.Parse(time.DateOnly, paramString)
			if err != nil {
				http.Error(w, "invalid param 'from'.", http.StatusBadRequest)
				return
			}
			filter.From = &orderFrom
		}
	}
	{
		paramString := r.URL.Query().Get("to")
		if paramString != "" {
			orderTo, err := time.Parse(time.DateOnly, paramString)
			if err != nil {
				http.Error(w, "invalid param 'to'.", http.StatusBadRequest)
				return
			}
			orderTo = orderTo.Add(24 * time.Hour)
			orderTo = orderTo.Add(-1 * time.Nanosecond)
			filter.To = &orderTo
		}
	}

	counts, err := c.OrderRepo.GetOrderCounts(filter)
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
