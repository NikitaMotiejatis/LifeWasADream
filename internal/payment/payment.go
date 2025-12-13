package payment

// Payment represents a payment transaction
type Payment struct {
	ID              int64   `json:"id" db:"id"`
	OrderID         int64   `json:"order_id" db:"order_id"`
	Amount          float64 `json:"amount" db:"amount"`
	Currency        string  `json:"currency" db:"currency"`
	PaymentMethod   string  `json:"payment_method" db:"payment_method"` // "stripe", "cash", "card"
	StripeSessionID string  `json:"stripe_session_id,omitempty" db:"stripe_session_id"`
	Status          string  `json:"status" db:"status"` // "pending", "completed", "failed", "cancelled"
	CreatedAt       string  `json:"created_at" db:"created_at"`
	UpdatedAt       string  `json:"updated_at" db:"updated_at"`
}

// CreatePaymentRequest is the request body for creating a payment
type CreatePaymentRequest struct {
	OrderID       int64   `json:"order_id" binding:"required"`
	Amount        float64 `json:"amount" binding:"required"`
	Currency      string  `json:"currency" binding:"required"`
	PaymentMethod string  `json:"payment_method" binding:"required"`
}

// StripeCheckoutRequest is the request to create a Stripe checkout session
type StripeCheckoutRequest struct {
	OrderID  int64   `json:"order_id" binding:"required"`
	Amount   float64 `json:"amount" binding:"required"`
	Currency string  `json:"currency" binding:"required"`
}

// StripeCheckoutResponse contains the Stripe session URL
type StripeCheckoutResponse struct {
	SessionID  string `json:"session_id"`
	SessionURL string `json:"session_url"`
}
