package reservation

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type ReservationController struct {
	ReservationRepo ReservationRepo
	ServiceRepo     ServiceRepo
	StaffRepo		StaffRepo
}

// Routes sets up chi router for reservations
func (c *ReservationController) Routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/", c.listReservations)
	router.Post("/", c.createReservation)
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
	filter := ReservationFilter{}

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
	json.NewEncoder(w).Encode(reservations)
}

// =====================
// POST /api/reservation
// =====================
func (c *ReservationController) createReservation(w http.ResponseWriter, r *http.Request) {
	var reservation Reservation
	if err := json.NewDecoder(r.Body).Decode(&reservation); err != nil {
		http.Error(w, "invalid reservation", http.StatusBadRequest)
		return
	}

	reservation.Id = c.generateReservationID()
	if reservation.Datetime.IsZero() {
		reservation.Datetime = time.Now()
	}
	if reservation.Status == "" {
		reservation.Status = "pending"
	}


	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(reservation)
}

// =====================
// GET /api/reservation/{id}
// =====================
func (c *ReservationController) getReservation(w http.ResponseWriter, r *http.Request) {
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
	json.NewEncoder(w).Encode(items)
}

// =====================
// GET /api/reservation/counts
// =====================
func (c *ReservationController) counts(w http.ResponseWriter, r *http.Request) {
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
	json.NewEncoder(w).Encode(counts)
}

// =====================
// GET /api/reservation/services
// =====================
func (c *ReservationController) listServices(w http.ResponseWriter, r *http.Request) {
	services, err := c.ServiceRepo.GetServices()
	if err != nil {
		http.Error(w, "failed to get services", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(services)
}

// =====================
// GET /api/reservation/staff
// =====================
func (c *ReservationController) listStaff(w http.ResponseWriter, r *http.Request) {
	staff, err := c.StaffRepo.GetStaff()
	if err != nil {
		http.Error(w, "failed to get staff", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(staff)
}

// =====================
// Helpers
// =====================
func (c *ReservationController) generateReservationID() string {
	return "RES-" + time.Now().Format("20060102150405")
}
