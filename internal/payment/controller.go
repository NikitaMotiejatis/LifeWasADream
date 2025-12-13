package payment

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type PaymentController struct {
	Service *PaymentService
}

// Routes sets up the payment routes
func (c *PaymentController) Routes() chi.Router {
	r := chi.NewRouter()

	r.Post("/stripe/create-checkout-session", c.createStripeCheckoutSession)
	r.Get("/stripe/verify/{sessionId}", c.verifyStripePayment)
	r.Post("/stripe/webhook", c.handleStripeWebhook)

	return r
}

// createStripeCheckoutSession creates a new Stripe checkout session
func (c *PaymentController) createStripeCheckoutSession(w http.ResponseWriter, r *http.Request) {
	var req StripeCheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	response, err := c.Service.CreateStripeCheckoutSession(req)
	if err != nil {
		if err == ErrInvalidAmount || err == ErrInvalidCurrency {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "failed to create checkout session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// verifyStripePayment verifies a Stripe payment session
func (c *PaymentController) verifyStripePayment(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "sessionId")
	if sessionID == "" {
		http.Error(w, "session ID required", http.StatusBadRequest)
		return
	}

	payment, err := c.Service.VerifyStripePayment(sessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payment)
}

// handleStripeWebhook handles Stripe webhook events
func (c *PaymentController) handleStripeWebhook(w http.ResponseWriter, r *http.Request) {
	const MaxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading request body", http.StatusBadRequest)
		return
	}

	signature := r.Header.Get("Stripe-Signature")
	if signature == "" {
		http.Error(w, "missing stripe signature", http.StatusBadRequest)
		return
	}

	err = c.Service.HandleStripeWebhook(payload, signature)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
