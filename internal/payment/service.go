package payment

import (
	"errors"
	"fmt"
	"time"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

var (
	ErrInternal            = errors.New("internal error")
	ErrPaymentNotFound     = errors.New("payment not found")
	ErrPaymentNotCompleted = errors.New("payment not completed")
	ErrInvalidAmount       = errors.New("invalid amount")
	ErrInvalidCurrency     = errors.New("invalid currency")
)

type PaymentService struct {
	StripeSecretKey string
	StripePublicKey string
	SuccessURL      string
	CancelURL       string
	// TODO: Add database connection when orders are implemented
}

// CreateStripeCheckoutSession creates a Stripe Checkout session
func (s *PaymentService) CreateStripeCheckoutSession(req StripeCheckoutRequest) (*StripeCheckoutResponse, error) {
	if req.Amount <= 0 {
		return nil, ErrInvalidAmount
	}

	if req.Currency == "" {
		req.Currency = "eur" // TO CHANGE: default to EUR
	}

	stripe.Key = s.StripeSecretKey

	// Convert amount to cents (Stripe requires smallest currency unit)
	amountInCents := int64(req.Amount * 100)

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String(req.Currency),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:        stripe.String(fmt.Sprintf("Order #%d", req.OrderID)),
						Description: stripe.String(fmt.Sprintf("Payment for Order #%d", req.OrderID)),
					},
					UnitAmount: stripe.Int64(amountInCents),
				},
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(s.SuccessURL + fmt.Sprintf("?session_id={CHECKOUT_SESSION_ID}&order_id=%d", req.OrderID)),
		CancelURL:  stripe.String(s.CancelURL + fmt.Sprintf("?order_id=%d", req.OrderID)),
		Metadata: map[string]string{
			"order_id": fmt.Sprintf("%d", req.OrderID),
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return nil, fmt.Errorf("%w: checkout session creation failed", ErrInternal)
	}

	// TODO: Store payment record in database when orders are implemented
	// payment := Payment{
	// 	OrderID:         req.OrderID,
	// 	Amount:          req.Amount,
	// 	Currency:        req.Currency,
	// 	PaymentMethod:   "stripe",
	// 	StripeSessionID: sess.ID,
	// 	Status:          "pending",
	// 	CreatedAt:       time.Now().Format(time.RFC3339),
	// }
	// err = s.createPayment(payment)

	return &StripeCheckoutResponse{
		SessionID:  sess.ID,
		SessionURL: sess.URL,
	}, nil
}

// VerifyStripePayment verifies a completed Stripe payment
func (s *PaymentService) VerifyStripePayment(sessionID string) (*Payment, error) {
	stripe.Key = s.StripeSecretKey

	sess, err := session.Get(sessionID, nil)
	if err != nil {
		return nil, ErrPaymentNotFound
	}

	if sess.PaymentStatus != stripe.CheckoutSessionPaymentStatusPaid {
		return nil, ErrPaymentNotCompleted
	}

	// TODO: Update payment status in database when orders are implemented
	payment := &Payment{
		StripeSessionID: sess.ID,
		Amount:          float64(sess.AmountTotal) / 100,
		Currency:        string(sess.Currency),
		PaymentMethod:   "stripe",
		Status:          "completed",
		UpdatedAt:       time.Now().Format(time.RFC3339),
	}

	// Extract order_id from metadata
	if orderID, ok := sess.Metadata["order_id"]; ok {
		// payment.OrderID = orderID // TODO: Parse and set when database is ready
		_ = orderID
	}

	return payment, nil
}

// HandleStripeWebhook handles Stripe webhook events
func (s *PaymentService) HandleStripeWebhook(payload []byte, signature string) error {
	// TODO: Implement webhook signature verification and event handling
	// This will be needed to update payment status in real-time
	// when Stripe processes the payment

	return nil
}
