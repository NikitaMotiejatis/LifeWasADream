package reservation

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type ReservationController struct {
	ReservationRepo ReservationRepo
	ServiceRepo     ServiceRepo
	StaffRepo       StaffRepo
	SMSService      SMSService
}

// Routes sets up chi router for reservations
func (c *ReservationController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/", c.listReservations)
	router.Post("/", c.createReservation)
	router.Put("/{id}", c.updateReservation)
	router.Get("/counts", c.counts)
	router.Get("/services", c.listServices)
	router.Get("/staff", c.listStaff)
	router.Get("/{id}", c.getReservation)

	return router
}

// =====================
// GET /api/reservation
// =====================
func (c *ReservationController) listReservations(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	filter := ReservationFilter{}

	search := r.URL.Query().Get("search")
	if search != "" {
		filter.Search = &search
	}

	status := r.URL.Query().Get("status")
	if status != "" && status != "all" {
		filter.Status = &status
	}

	fromStr := r.URL.Query().Get("from")
	if fromStr != "" {
		from, err := time.Parse(time.RFC3339, fromStr)
		if err != nil {
			http.Error(w, "invalid param 'from'", http.StatusBadRequest)
			return
		}
		from = from.UTC()
		filter.From = &from
	}

	toStr := r.URL.Query().Get("to")
	if toStr != "" {
		to, err := time.Parse(time.RFC3339, toStr)
		if err != nil {
			http.Error(w, "invalid param 'to'", http.StatusBadRequest)
			return
		}
		to = to.UTC()
		filter.To = &to
	}

	reservations, err := c.ReservationRepo.GetReservations(filter)
	if err != nil {
		http.Error(w, "failed to get reservations", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(reservations); err != nil {
		http.Error(w, "failed to encode reservations", http.StatusInternalServerError)
		return
	}
}

// =====================
// POST /api/reservation
// =====================
func (c *ReservationController) createReservation(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	writeJSONError := func(msg string, code int) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
	}

	var reservation Reservation
	if err := json.NewDecoder(r.Body).Decode(&reservation); err != nil {
		writeJSONError("invalid reservation payload", http.StatusBadRequest)
		return
	}

	if reservation.Datetime.IsZero() {
		reservation.Datetime = time.Now().UTC()
	}
	if reservation.Status == "" {
		reservation.Status = "pending"
	}
	if reservation.CustomerName == "" {
		writeJSONError("customer name is required", http.StatusBadRequest)
		return
	}
	if reservation.CustomerPhone == "" {
		writeJSONError("customer phone is required", http.StatusBadRequest)
		return
	}
	// Match DB constraint: + and 3-15 digits
	phonePattern := regexp.MustCompile(`^\+[0-9]{3,15}$`)
	if !phonePattern.MatchString(reservation.CustomerPhone) {
		writeJSONError("customer phone must match +[3-15 digits]", http.StatusBadRequest)
		return
	}
	if reservation.ServiceId == "" {
		writeJSONError("serviceId is required", http.StatusBadRequest)
		return
	}

	id, err := c.ReservationRepo.CreateReservation(reservation)
	if err != nil {
		writeJSONError("failed to create reservation", http.StatusInternalServerError)
		return
	}

	response := map[string]any{
		"id": id,
	}

	// Send SMS confirmation if status is confirmed and SMS service is available
	if reservation.Status == string(ReservationConfirmed) && c.SMSService != nil {
		if err := c.SMSService.SendReservationConfirmation(&reservation); err != nil {
			// Log the error but don't fail the reservation creation
			// TODO: Add proper logging
			_ = err
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		writeJSONError("failed to encode reservation", http.StatusInternalServerError)
		return
	}
}

// =====================
// GET /api/reservation/{id}
// =====================
func (c *ReservationController) getReservation(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		http.Error(w, "missing reservation ID", http.StatusBadRequest)
		return
	}

	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		http.Error(w, "invalid reservation ID", http.StatusBadRequest)
		return
	}

	items, err := c.ReservationRepo.GetReservationItems(int32(id))
	if err != nil {
		http.Error(w, "failed to get reservation items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(items); err != nil {
		http.Error(w, "failed to encode reservation items", http.StatusInternalServerError)
		return
	}
}

// =====================
// PUT /api/reservation/{id}
// =====================
func (c *ReservationController) updateReservation(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	writeJSONError := func(msg string, code int) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
	}

	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		writeJSONError("invalid reservation ID", http.StatusBadRequest)
		return
	}

	var update ReservationUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		writeJSONError("invalid reservation", http.StatusBadRequest)
		return
	}

	err = c.ReservationRepo.UpdateReservation(int32(id), update)
	if err != nil {
		writeJSONError("failed to update reservation", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// =====================
// GET /api/reservation/counts
// =====================
func (c *ReservationController) counts(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	filter := ReservationFilter{}

	fromStr := r.URL.Query().Get("from")
	if fromStr != "" {
		from, err := time.Parse(time.RFC3339, fromStr)
		if err != nil {
			http.Error(w, "invalid param 'from'", http.StatusBadRequest)
			return
		}
		from = from.UTC()
		filter.From = &from
	}

	toStr := r.URL.Query().Get("to")
	if toStr != "" {
		to, err := time.Parse(time.RFC3339, toStr)
		if err != nil {
			http.Error(w, "invalid param 'to'", http.StatusBadRequest)
			return
		}
		to = to.UTC()
		filter.To = &to
	}

	counts, err := c.ReservationRepo.GetReservationCounts(filter)
	if err != nil {
		http.Error(w, "failed to count reservations", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(counts); err != nil {
		http.Error(w, "failed to encode counts", http.StatusInternalServerError)
		return
	}
}

// =====================
// GET /api/reservation/services
// =====================
func (c *ReservationController) listServices(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	services, err := c.ServiceRepo.GetServices()
	if err != nil {
		http.Error(w, "failed to get services", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(services); err != nil {
		http.Error(w, "failed to encode services", http.StatusInternalServerError)
		return
	}
}

// =====================
// GET /api/reservation/staff
// =====================
func (c *ReservationController) listStaff(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	staff, err := c.StaffRepo.GetStaff()
	if err != nil {
		http.Error(w, "failed to get staff", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(staff); err != nil {
		http.Error(w, "failed to encode staff", http.StatusInternalServerError)
		return
	}
}

// =====================
// Helpers
// =====================
func (c *ReservationController) generateReservationID() string {
	return "RES-" + time.Now().Format("20060102150405")
}
