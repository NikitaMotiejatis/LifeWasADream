package refund

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

type RefundController struct {
	RefundRepo    RefundRepo
	RefundService Service // Interface for Stripe refund
}

func (c *RefundController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/", c.getPendingRefunds)
	router.Post("/{refundId:^[0-9]{1,10}$}/action", c.processRefundAction)

	return router
}

func (c *RefundController) getPendingRefunds(w http.ResponseWriter, _ *http.Request) {
	refunds, err := c.RefundRepo.GetPendingRefunds()
	if err != nil {
		http.Error(w, "failed to retrieve pending refunds", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(refunds); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (c *RefundController) processRefundAction(w http.ResponseWriter, r *http.Request) {
	refundId, err := strconv.ParseUint(chi.URLParam(r, "refundId"), 10, 32)
	if err != nil {
		http.Error(w, "invalid refund ID", http.StatusBadRequest)
		return
	}

	var req RefundActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	refundRecord, err := c.RefundRepo.GetRefundByID(uint32(refundId))
	if err != nil {
		http.Error(w, "refund not found", http.StatusNotFound)
		return
	}

	if refundRecord.Status != StatusPending {
		http.Error(w, "refund is not in pending status", http.StatusConflict)
		return
	}

	switch req.Action {
	case "approve":
		_, err = c.RefundRepo.UpdateRefundStatus(refundRecord.ID, StatusProcessing, "")
		if err != nil {
			http.Error(w, "failed to update refund status to processing", http.StatusInternalServerError)
			return
		}

		stripeRefundID := ""
		isStripeRefund := refundRecord.StripePaymentIntentID != "" || strings.EqualFold(refundRecord.PaymentMethod, "stripe")
		if isStripeRefund {
			if refundRecord.StripePaymentIntentID == "" {
				http.Error(w, "stripe payment intent ID not available for this refund", http.StatusBadRequest)
				return
			}
			if refundRecord.AmountCents <= 0 {
				http.Error(w, "invalid refund amount", http.StatusBadRequest)
				return
			}

			stripeRefundID, err = c.RefundService.ProcessRefund(refundRecord.StripePaymentIntentID, refundRecord.AmountCents)
			if err != nil {
				_, _ = c.RefundRepo.UpdateRefundStatus(refundRecord.ID, StatusFailed, "")
				http.Error(w, "Stripe refund failed: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		_, err = c.RefundRepo.UpdateRefundStatus(refundRecord.ID, StatusCompleted, stripeRefundID)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			msg := "Refund completed successfully, but failed to update final status in DB."
			if stripeRefundID != "" {
				msg = fmt.Sprintf("Refund completed successfully with Stripe, but failed to update final status in DB. Stripe ID: %s", stripeRefundID)
			}
			_ = json.NewEncoder(w).Encode(map[string]string{"message": msg})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		msg := "Refund approved and completed successfully."
		if stripeRefundID != "" {
			msg = fmt.Sprintf("Refund approved and completed successfully. Stripe ID: %s", stripeRefundID)
		}
		_ = json.NewEncoder(w).Encode(map[string]string{"message": msg})

	case "disapprove":
		_, err = c.RefundRepo.UpdateRefundStatus(refundRecord.ID, StatusDisapproved, "")
		if err != nil {
			http.Error(w, "failed to update refund status", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]string{"message": "Refund disapproved."})

	default:
		http.Error(w, "invalid action. Must be 'approve' or 'disapprove'", http.StatusBadRequest)
		return
	}
}
