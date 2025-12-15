package refund

import "time"

type RefundStatus string

const (
	StatusPending     RefundStatus = "Pending"
	StatusApproved    RefundStatus = "Approved"
	StatusDisapproved RefundStatus = "Disapproved"
	StatusProcessing  RefundStatus = "Processing" // For when Stripe request is sent
	StatusCompleted   RefundStatus = "Completed"  // For when Stripe confirms refund
	StatusFailed      RefundStatus = "Failed"     // For when Stripe request fails
)

// Refund represents a refund request for an order.
type Refund struct {
	ID             uint32       `json:"id"`
	OrderID        uint32       `json:"orderId"`
	Amount         float64      `json:"amount"`
	Reason         string       `json:"reason"`
	Status         RefundStatus `json:"status"`
	RequestedAt    time.Time    `json:"requestedAt"`
	ProcessedAt    *time.Time   `json:"processedAt,omitempty"`
	StripeChargeID string       `json:"stripeChargeId"`
	StripeRefundID string       `json:"stripeRefundId,omitempty"`
}

type RefundActionRequest struct {
	Action string `json:"action"`
	Reason string `json:"reason"`
}
