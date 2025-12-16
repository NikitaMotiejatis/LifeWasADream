package payment

// Payment transaction
type Payment struct {
	ID                    int64  `json:"id" db:"id"`
	OrderID               int64  `json:"order_id" db:"order_id"`
	AmountCents           int64  `json:"amountCents" db:"amount"`
	Currency              string `json:"currency" db:"currency"`
	PaymentMethod         string `json:"payment_method" db:"payment_method"` // "stripe", "cash", "card"
	StripeSessionID       string `json:"stripe_session_id,omitempty" db:"stripe_session_id"`
	StripePaymentIntentID string `json:"stripe_payment_intent_id,omitempty" db:"stripe_payment_intent_id"`
	Status                string `json:"status" db:"status"` // "pending", "completed", "failed", "cancelled"
	CreatedAt             string `json:"created_at" db:"created_at"`
	UpdatedAt             string `json:"updated_at" db:"updated_at"`
}

// Request body for creating a payment
type CreatePaymentRequest struct {
	OrderID       int64  `json:"order_id" binding:"required"`
	Currency      string `json:"currency" binding:"required"`
	PaymentMethod string `json:"payment_method" binding:"required"`
}

// Request to create a Stripe checkout session
type StripeCheckoutRequest struct {
	OrderID int64 `json:"order_id" binding:"required"`
}

// Request to create a Stripe checkout session for a reservation
type StripeReservationCheckoutRequest struct {
	ReservationID int32 `json:"reservation_id" binding:"required"`
	Currency      string `json:"currency,omitempty"`
}

// Contains the Stripe session URL
type StripeCheckoutResponse struct {
	SessionID  string `json:"session_id"`
	SessionURL string `json:"session_url"`
}
