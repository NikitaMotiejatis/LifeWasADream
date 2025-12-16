package payment

import (
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
	StripeSecretKey       string
	StripePublicKey       string
	SuccessURL            string
	CancelURL             string
	ReservationSuccessURL string
	ReservationCancelURL  string
	OrderTotals           OrderTotalProvider
	OrderStatus           OrderStatusUpdater
	PaymentRepo           PaymentRepo
	OrderItems            OrderItemsProvider
	OrderTip              OrderTipProvider
	ReservationTotals     ReservationTotalProvider
	ReservationStatus     ReservationStatusUpdater
	ReservationItems      ReservationItemsProvider
}

type OrderTotalProvider interface {
	GetOrderTotal(orderID int64) (int64, string, error)
}

type OrderStatusUpdater interface {
	MarkOrderClosed(orderID int64) error
}

type OrderItemsProvider interface {
	GetOrderItemsForPayment(orderID int64) ([]OrderItem, error)
}

type OrderTipProvider interface {
	GetOrderTipCents(orderID int64) (int64, error)
}

type ReservationTotalProvider interface {
	GetReservationTotal(reservationID int32) (int64, string, error)
}

type ReservationStatusUpdater interface {
	MarkReservationCompleted(reservationID int32) error
}

type ReservationItemsProvider interface {
	GetReservationItemsForPayment(reservationID int32) ([]OrderItem, error)
}

type OrderItem struct {
	Name     string
	Quantity int
	Price    int64 // in cents
}

// Creates a Stripe Checkout session
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

	// Append tip as a separate line item if available
	if s.OrderTip != nil {
		tipCents, err := s.OrderTip.GetOrderTipCents(req.OrderID)
		if err == nil && tipCents > 0 {
			lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String(stripeCurrency),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String("Tip"),
					},
					UnitAmount: stripe.Int64(tipCents),
				},
				Quantity: stripe.Int64(1),
			})
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

// Creates a Stripe Checkout session for a reservation
func (s *PaymentService) CreateStripeReservationCheckoutSession(req StripeReservationCheckoutRequest) (*StripeCheckoutResponse, error) {
	if s.ReservationTotals == nil {
		return nil, fmt.Errorf("%w: reservation total provider not configured", ErrInternal)
	}
	if s.PaymentRepo == nil {
		return nil, fmt.Errorf("%w: payment repository not configured", ErrInternal)
	}

	amountCents, currency, err := s.ReservationTotals.GetReservationTotal(req.ReservationID)
	if err != nil {
		return nil, ErrInternal
	}
	if amountCents <= 0 {
		return nil, ErrInvalidAmount
	}
	if currency == "" && strings.TrimSpace(req.Currency) == "" {
		return nil, ErrInvalidCurrency
	}

	stripeCurrency := strings.ToLower(currency)
	if strings.TrimSpace(req.Currency) != "" {
		stripeCurrency = strings.ToLower(strings.TrimSpace(req.Currency))
		currency = stripeCurrency
	}

	stripe.Key = s.StripeSecretKey

	// Build line items from reservation items
	var lineItems []*stripe.CheckoutSessionLineItemParams

	if s.ReservationItems != nil {
		resItems, err := s.ReservationItems.GetReservationItemsForPayment(req.ReservationID)
		if err == nil && len(resItems) > 0 {
			// Create line items for each reservation service
			for _, item := range resItems {
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
						Name:        stripe.String(fmt.Sprintf("Reservation #%d", req.ReservationID)),
						Description: stripe.String(fmt.Sprintf("Payment for Reservation #%d", req.ReservationID)),
					},
					UnitAmount: stripe.Int64(amountCents),
				},
				Quantity: stripe.Int64(1),
			},
		}
	}

	successBaseURL := s.ReservationSuccessURL
	cancelBaseURL := s.ReservationCancelURL
	if successBaseURL == "" {
		successBaseURL = s.SuccessURL
	}
	if cancelBaseURL == "" {
		cancelBaseURL = s.CancelURL
	}

	successURL := successBaseURL + fmt.Sprintf("?session_id={CHECKOUT_SESSION_ID}&reservation_id=%d", req.ReservationID)
	cancelURL := cancelBaseURL + fmt.Sprintf("?reservation_id=%d", req.ReservationID)

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		LineItems:  lineItems,
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		Metadata: map[string]string{
			"reservation_id": fmt.Sprintf("%d", req.ReservationID),
			"type":           "reservation",
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

	// HACK: Store payment recod, for both reservation and order
	payment := Payment{
		OrderID:               int64(req.ReservationID),
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

// Verifies a completed Stripe payment
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

			// Check metadata to determine if this is an order or reservation
			if sess.Metadata != nil {
				paymentType, hasType := sess.Metadata["type"]

				if hasType && paymentType == "reservation" {
					if reservationIDStr, ok := sess.Metadata["reservation_id"]; ok {
						if parsed, err := strconv.ParseInt(reservationIDStr, 10, 64); err == nil {
							payment.OrderID = parsed // Using OrderID field for reservation_id

							if s.ReservationStatus != nil && parsed > 0 {
								if err := s.ReservationStatus.MarkReservationCompleted(int32(parsed)); err != nil {
									fmt.Printf("Warning: failed to mark reservation as completed: %v\n", err)
								}
							}
						}
					}
				} else if orderID, ok := sess.Metadata["order_id"]; ok {
					if parsed, err := strconv.ParseInt(orderID, 10, 64); err == nil {
						payment.OrderID = parsed

						if s.OrderStatus != nil && payment.OrderID > 0 {
							if err := s.OrderStatus.MarkOrderClosed(payment.OrderID); err != nil {
								fmt.Printf("Warning: failed to mark order as closed: %v\n", err)
							}
						}
					}
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

	// Re-fetch session to check metadata for completing order/reservation
	params2 := &stripe.CheckoutSessionParams{}
	sess2, err := session.Get(sessionID, params2)
	if err == nil && sess2.Metadata != nil {
		paymentType, hasType := sess2.Metadata["type"]

		if hasType && paymentType == "reservation" {
			if reservationIDStr, ok := sess2.Metadata["reservation_id"]; ok {
				if reservationID, err := strconv.ParseInt(reservationIDStr, 10, 32); err == nil && reservationID > 0 {
					if s.ReservationStatus != nil {
						if err := s.ReservationStatus.MarkReservationCompleted(int32(reservationID)); err != nil {
							fmt.Printf("Warning: failed to mark reservation as completed: %v\n", err)
						}
					}
				}
			}
		} else if s.OrderStatus != nil && payment.OrderID > 0 {
			if err := s.OrderStatus.MarkOrderClosed(payment.OrderID); err != nil {
				fmt.Printf("Warning: failed to mark order as closed: %v\n", err)
			}
		}
	}

	return payment, nil
}
