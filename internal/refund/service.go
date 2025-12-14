package refund

import (
	"fmt"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/refund"
)

type Service interface {
	ProcessRefund(chargeID string, amount float64) (string, error)
}

type StripeService struct {
	StripeSecretKey string
}

func (s *StripeService) ProcessRefund(chargeID string, amount float64) (string, error) {
	stripe.Key = s.StripeSecretKey

	// Converting amount to cents (Stripe requires smallest currency unit)
	amountInCents := int64(amount * 100)

	params := &stripe.RefundParams{
		Charge: stripe.String(chargeID),
		Amount: stripe.Int64(amountInCents),
		// More parameters can be added here, like Reason, Currency, etc.
	}

	r, err := refund.New(params)
	if err != nil {
		return "", fmt.Errorf("stripe refund failed: %w", err)
	}

	return r.ID, nil
}
