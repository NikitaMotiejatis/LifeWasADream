package refund

import (
	"errors"
	"sync"
	"time"
)

// RefundRepo defines the interface for refund data operations.
type RefundRepo interface {
	GetPendingRefunds() ([]Refund, error)
	UpdateRefundStatus(id uint32, status RefundStatus, stripeRefundID string) (*Refund, error)
	GetRefundByID(id uint32) (*Refund, error)
}

// MockRefundRepo is a mock implementation of RefundRepo for development.
type MockRefundRepo struct {
	mu      sync.RWMutex
	refunds map[uint32]*Refund
	nextID  uint32
}

// NewMockRefundRepo creates a new instance of MockRefundRepo.
func NewMockRefundRepo() *MockRefundRepo {
	return &MockRefundRepo{
		refunds: map[uint32]*Refund{
			1: {
				ID:             1,
				OrderID:        101,
				Amount:         50.00,
				Reason:         "Customer requested full refund",
				Status:         StatusPending,
				RequestedAt:    time.Now().Add(-24 * time.Hour),
				StripeChargeID: "ch_1QmBvCEYcB69ywE0gF3xK1aM", // Valid Stripe test charge ID
			},
			2: {
				ID:             2,
				OrderID:        102,
				Amount:         10.50,
				Reason:         "Item out of stock",
				Status:         StatusPending,
				RequestedAt:    time.Now().Add(-12 * time.Hour),
				StripeChargeID: "ch_1QmBvCEYcB69ywE0nJ7pQ2bN", // Valid Stripe test charge ID
			},
			3: {
				ID:             3,
				OrderID:        103,
				Amount:         25.00,
				Reason:         "Partial refund for damaged goods",
				Status:         StatusCompleted,
				RequestedAt:    time.Now().Add(-48 * time.Hour),
				ProcessedAt:    func() *time.Time { t := time.Now().Add(-24 * time.Hour); return &t }(),
				StripeChargeID: "ch_1QmBvCEYcB69ywE0rT9vS3cO",
				StripeRefundID: "re_1QmBvCEYcB69ywE0aBcDeF1g", // Example completed refund ID
			},
		},
		nextID: 4,
	}
}

// GetPendingRefunds returns all refunds with StatusPending.
func (r *MockRefundRepo) GetPendingRefunds() ([]Refund, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var pending []Refund
	for _, refund := range r.refunds {
		if refund.Status == StatusPending {
			pending = append(pending, *refund)
		}
	}
	return pending, nil
}

// GetRefundByID returns a refund by its ID.
func (r *MockRefundRepo) GetRefundByID(id uint32) (*Refund, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	refund, ok := r.refunds[id]
	if !ok {
		return nil, errors.New("refund not found")
	}
	return refund, nil
}

// UpdateRefundStatus updates the status and optionally the StripeRefundID of a refund.
func (r *MockRefundRepo) UpdateRefundStatus(id uint32, status RefundStatus, stripeRefundID string) (*Refund, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	refund, ok := r.refunds[id]
	if !ok {
		return nil, errors.New("refund not found")
	}

	refund.Status = status
	now := time.Now()
	refund.ProcessedAt = &now
	if stripeRefundID != "" {
		refund.StripeRefundID = stripeRefundID
	}

	return refund, nil
}
