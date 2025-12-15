package refund

import (
	"fmt"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/refund"
)

type Service interface {
	ProcessRefund(paymentIntentID string, amountCents int64) (string, error)
}

type StripeService struct {
	StripeSecretKey string
}

func (s *StripeService) ProcessRefund(paymentIntentID string, amountCents int64) (string, error) {
	stripe.Key = s.StripeSecretKey

	params := &stripe.RefundParams{
		PaymentIntent: stripe.String(paymentIntentID),
		Amount:        stripe.Int64(amountCents),
		// More parameters can be added here, like Reason, Currency, etc.
	}

	r, err := refund.New(params)
	if err != nil {
		return "", fmt.Errorf("stripe refund failed: %w", err)
	}

	return r.ID, nil
}
