package payment

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
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
	r.Post("/stripe/create-reservation-checkout-session", c.createStripeReservationCheckoutSession)
	r.Get("/stripe/verify/{sessionId}", c.verifyStripePayment)
	r.Post("/stripe/webhook", c.handleStripeWebhook)

	return r
}

// creates a new Stripe checkout session
func (c *PaymentController) createStripeCheckoutSession(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	var req StripeCheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.OrderID <= 0 {
		http.Error(w, "order ID is required", http.StatusBadRequest)
		return
	}

	response, err := c.Service.CreateStripeCheckoutSession(req)
	if err != nil {
		// Expose only safe erros to client
		if errors.Is(err, ErrInvalidAmount) || errors.Is(err, ErrInvalidCurrency) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		slog.Error("Failed to create checkout session",
			"order_id", req.OrderID,
			"error", err)
		http.Error(w, "failed to create checkout session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		slog.Error("Failed to encode checkout response", "error", err)
		return
	}
}

// creates a new Stripe checkout session for a reservation
func (c *PaymentController) createStripeReservationCheckoutSession(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	var req StripeReservationCheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.ReservationID <= 0 {
		http.Error(w, "reservation ID is required", http.StatusBadRequest)
		return
	}

	response, err := c.Service.CreateStripeReservationCheckoutSession(req)
	if err != nil {
		// Expose only safe errors to client
		if errors.Is(err, ErrInvalidAmount) || errors.Is(err, ErrInvalidCurrency) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		slog.Error("Failed to create reservation checkout session",
			"reservation_id", req.ReservationID,
			"error", err)
		http.Error(w, "failed to create reservation checkout session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		slog.Error("Failed to encode reservation checkout response", "error", err)
		return
	}
}

// verifyStripePayment verifies a Stripe payment session
func (c *PaymentController) verifyStripePayment(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	sessionID := chi.URLParam(r, "sessionId")
	if sessionID == "" {
		http.Error(w, "session ID required", http.StatusBadRequest)
		return
	}

	payment, err := c.Service.VerifyStripePayment(sessionID)
	if err != nil {
		// Expose only safe erros to client
		if errors.Is(err, ErrPaymentNotFound) {
			slog.Warn("Payment session not found", "session_id", sessionID)
			http.Error(w, "payment session not found", http.StatusNotFound)
			return
		}
		if errors.Is(err, ErrPaymentNotCompleted) {
			slog.Warn("Payment not completed", "session_id", sessionID)
			http.Error(w, "payment not completed", http.StatusBadRequest)
			return
		}
		slog.Error("Failed to verify payment",
			"session_id", sessionID,
			"error", err)
		http.Error(w, "failed to verify payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(payment); err != nil {
		slog.Error("Failed to encode payment verification response", "error", err)
		return
	}
}

// handleStripeWebhook handles Stripe webhook events
func (c *PaymentController) handleStripeWebhook(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

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
		// Expose only safe erros to client
		slog.Error("Webhook processing failed", "error", err)
		http.Error(w, "webhook processing failed", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
