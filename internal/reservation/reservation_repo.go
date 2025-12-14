package reservation

import "time"

type ReservationRepo interface {
	GetReservations(filter ReservationFilter) ([]Reservation, error)
	GetReservationCounts(filter ReservationFilter) (ReservationCounts, error)
	GetReservationItems(reservationId int32) ([]Service, error)
	CreateReservation(res Reservation) (int32, error)
	UpdateReservation(id int32, res ReservationUpdate) error
}

// Options for filtering reservations.
// If a filter field should be ignored, it should be set to nil pointer.
type ReservationFilter struct {
	Search *string
	Status *string
	From   *time.Time
	To     *time.Time
}
