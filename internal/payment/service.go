package payment

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
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
	OrderTotals     OrderTotalProvider
	PaymentRepo     PaymentRepo
	OrderItems      OrderItemsProvider
}

type OrderTotalProvider interface {
	GetOrderTotal(orderID int64) (int64, string, error)
}

type OrderItemsProvider interface {
	GetOrderItemsForPayment(orderID int64) ([]OrderItem, error)
}

type OrderItem struct {
	Name     string
	Quantity int
	Price    int64 // in cents
}

// CreateStripeCheckoutSession creates a Stripe Checkout session
func (s *PaymentService) CreateStripeCheckoutSession(req StripeCheckoutRequest) (*StripeCheckoutResponse, error) {
	if s.OrderTotals == nil {
		return nil, fmt.Errorf("%w: order total provider not configured", ErrInternal)
	}
	if s.PaymentRepo == nil {
		return nil, fmt.Errorf("%w: payment repository not configured", ErrInternal)
	}

	amountCents, currency, err := s.OrderTotals.GetOrderTotal(req.OrderID)
	if err != nil {
		return nil, ErrInternal
	}
	if amountCents <= 0 {
		return nil, ErrInvalidAmount
	}
	if currency == "" {
		return nil, ErrInvalidCurrency
	}

	stripeCurrency := strings.ToLower(currency)

	stripe.Key = s.StripeSecretKey

	// Build line items from order items
	var lineItems []*stripe.CheckoutSessionLineItemParams

	if s.OrderItems != nil {
		orderItems, err := s.OrderItems.GetOrderItemsForPayment(req.OrderID)
		if err == nil && len(orderItems) > 0 {
			// Create line items for each order item
			for _, item := range orderItems {
				lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
					PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
						Currency: stripe.String(stripeCurrency),
						ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
							Name: stripe.String(item.Name),
						},
						UnitAmount: stripe.Int64(item.Price),
					},
					Quantity: stripe.Int64(int64(item.Quantity)),
				})
			}
		}
	}

	// Fallback to single line item if no items or error
	if len(lineItems) == 0 {
		lineItems = []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String(stripeCurrency),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:        stripe.String(fmt.Sprintf("Order #%d", req.OrderID)),
						Description: stripe.String(fmt.Sprintf("Payment for Order #%d", req.OrderID)),
					},
					UnitAmount: stripe.Int64(amountCents),
				},
				Quantity: stripe.Int64(1),
			},
		}
	}

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		LineItems:  lineItems,
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(s.SuccessURL + fmt.Sprintf("?session_id={CHECKOUT_SESSION_ID}&order_id=%d", req.OrderID)),
		CancelURL:  stripe.String(s.CancelURL + fmt.Sprintf("?order_id=%d", req.OrderID)),
		Metadata: map[string]string{
			"order_id": fmt.Sprintf("%d", req.OrderID),
		},
	}
	params.AddExpand("payment_intent")

	sess, err := session.New(params)
	if err != nil {
		return nil, fmt.Errorf("%w: checkout session creation failed", ErrInternal)
	}

	stripePaymentIntentID := ""
	if sess.PaymentIntent != nil {
		stripePaymentIntentID = sess.PaymentIntent.ID
	}

	// Store payment record in database
	payment := Payment{
		OrderID:               req.OrderID,
		AmountCents:           amountCents,
		Currency:              currency,
		PaymentMethod:         "stripe",
		StripeSessionID:       sess.ID,
		StripePaymentIntentID: stripePaymentIntentID,
		Status:                "pending",
		CreatedAt:             time.Now().Format(time.RFC3339),
		UpdatedAt:             time.Now().Format(time.RFC3339),
	}
	_, err = s.PaymentRepo.CreatePayment(payment)
	if err != nil {
		// Log error but don't fail the checkout session
		fmt.Printf("Warning: failed to store payment record: %v\n", err)
	}

	return &StripeCheckoutResponse{
		SessionID:  sess.ID,
		SessionURL: sess.URL,
	}, nil
}

// VerifyStripePayment verifies a completed Stripe payment
func (s *PaymentService) VerifyStripePayment(sessionID string) (*Payment, error) {
	if s.PaymentRepo == nil {
		return nil, fmt.Errorf("%w: payment repository not configured", ErrInternal)
	}

	stripe.Key = s.StripeSecretKey

	params := &stripe.CheckoutSessionParams{}
	params.AddExpand("payment_intent")
	sess, err := session.Get(sessionID, params)
	if err != nil {
		return nil, ErrPaymentNotFound
	}

	stripePaymentIntentID := ""
	if sess.PaymentIntent != nil {
		stripePaymentIntentID = sess.PaymentIntent.ID
	}

	if sess.PaymentStatus != stripe.CheckoutSessionPaymentStatusPaid {
		return nil, ErrPaymentNotCompleted
	}

	// Get payment from database
	payment, err := s.PaymentRepo.GetPaymentBySessionID(sessionID)
	if err != nil {
		// If not found in DB, create a minimal payment record
		if err == ErrPaymentNotFound {
			payment = &Payment{
				StripeSessionID:       sess.ID,
				StripePaymentIntentID: stripePaymentIntentID,
				AmountCents:           int64(sess.AmountTotal),
				Currency:              string(sess.Currency),
				PaymentMethod:         "stripe",
				Status:                "completed",
				UpdatedAt:             time.Now().Format(time.RFC3339),
			}
			// Extract order_id from metadata
			if orderID, ok := sess.Metadata["order_id"]; ok {
				if parsed, err := strconv.ParseInt(orderID, 10, 64); err == nil {
					payment.OrderID = parsed
				}
			}
			return payment, nil
		}
		return nil, err
	}

	// Update payment status in database
	if payment.Status != "completed" {
		err = s.PaymentRepo.UpdatePaymentStatus(sessionID, "completed")
		if err != nil {
			// Log error but continue
			fmt.Printf("Warning: failed to update payment status: %v\n", err)
		} else {
			payment.Status = "completed"
			payment.UpdatedAt = time.Now().Format(time.RFC3339)
		}
	}

	// Persist payment intent ID for refund processing
	if stripePaymentIntentID != "" && payment.StripePaymentIntentID != stripePaymentIntentID {
		if err := s.PaymentRepo.UpdatePaymentIntentID(sessionID, stripePaymentIntentID); err != nil && err != ErrPaymentNotFound {
			fmt.Printf("Warning: failed to update payment intent ID: %v\n", err)
		} else {
			payment.StripePaymentIntentID = stripePaymentIntentID
		}
	}

	return payment, nil
}

// HandleStripeWebhook handles Stripe webhook events
func (s *PaymentService) HandleStripeWebhook(payload []byte, signature string) error {
	if s.PaymentRepo == nil {
		return fmt.Errorf("%w: payment repository not configured", ErrInternal)
	}

	stripe.Key = s.StripeSecretKey

	// Verify webhook signature (webhook secret should be configured)
	// For now, we'll process the event without signature verification

	var event stripe.Event
	if err := json.Unmarshal(payload, &event); err != nil {
		return fmt.Errorf("failed to parse webhook payload: %w", err)
	}

	// Handle different event types
	switch event.Type {
	case "checkout.session.completed":
		var checkoutSession stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &checkoutSession); err != nil {
			return fmt.Errorf("failed to parse checkout session: %w", err)
		}

		stripePaymentIntentID := ""
		if checkoutSession.PaymentIntent != nil {
			stripePaymentIntentID = checkoutSession.PaymentIntent.ID
		}

		if stripePaymentIntentID != "" {
			err := s.PaymentRepo.UpdatePaymentIntentID(checkoutSession.ID, stripePaymentIntentID)
			if err != nil && err != ErrPaymentNotFound {
				return fmt.Errorf("failed to update payment intent: %w", err)
			}
		}

		// Update payment status to completed
		if checkoutSession.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid {
			err := s.PaymentRepo.UpdatePaymentStatus(checkoutSession.ID, "completed")
			if err != nil && err != ErrPaymentNotFound {
				return fmt.Errorf("failed to update payment status: %w", err)
			}
		}

	case "checkout.session.expired":
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
			return fmt.Errorf("failed to parse checkout session: %w", err)
		}

		// Update payment status to cancelled
		err := s.PaymentRepo.UpdatePaymentStatus(session.ID, "cancelled")
		if err != nil && err != ErrPaymentNotFound {
			return fmt.Errorf("failed to update payment status: %w", err)
		}

	case "payment_intent.payment_failed":
		var paymentIntent stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
			return fmt.Errorf("failed to parse payment intent: %w", err)
		}

		// Find payment by stripe session and update to failed
		// For now, we just log it
		fmt.Printf("Payment failed for payment intent: %s\n", paymentIntent.ID)
	}

	return nil
}
