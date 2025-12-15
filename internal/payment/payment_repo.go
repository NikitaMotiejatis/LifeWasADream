package payment

// PaymentRepo provides database operations for payments
type PaymentRepo interface {
	CreatePayment(payment Payment) (int64, error)
	UpdatePaymentStatus(sessionID string, status string) error
	GetPaymentBySessionID(sessionID string) (*Payment, error)
	GetPaymentByOrderID(orderID int64) (*Payment, error)
	GetPaymentByPaymentIntentID(paymentIntentID string) (*Payment, error)
}
