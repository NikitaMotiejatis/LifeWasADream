package reservation

import "time"

type ReservationStatus string

const (
	ReservationPending       ReservationStatus = "pending"
	ReservationConfirmed     ReservationStatus = "confirmed"
	ReservationCompleted     ReservationStatus = "completed"
	ReservationCancelled     ReservationStatus = "cancelled"
	ReservationNoShow        ReservationStatus = "no_show"
	ReservationRefundPending ReservationStatus = "refund_pending"
)

type Reservation struct {
	Id           	string
	CustomerName 	string
	CustomerPhone 	string
	StaffId        	string
	ServiceId      	string
	Datetime     	time.Time
	Status       	string
}

type ReservationCounts struct {
	All            int `json:"all"`
	Pending        int `json:"pending"`
	Confirmed      int `json:"confirmed"`
	Completed      int `json:"completed"`
	Cancelled      int `json:"cancelled"`
	NoShow         int `json:"no_show"`
	RefundPending  int `json:"refund_pending"`
}

type Service struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	NameKey  string `json:"nameKey"`
	Duration int    `json:"duration"`
	Price    int    `json:"price"`
}

type Staff struct {
	Id       string   `json:"id"`
	Name     string   `json:"name"`
	Role     string   `json:"role"`
	Services []string `json:"services"`
}