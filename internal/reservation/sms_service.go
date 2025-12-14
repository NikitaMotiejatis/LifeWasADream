package reservation

import (
	"fmt"

	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
)

// SMSService handles sending SMS messages
type SMSService interface {
	SendReservationConfirmation(reservation *Reservation) error
}

// TwilioSMSService implements SMSService using Twilio
type TwilioSMSService struct {
	Client      *twilio.RestClient
	FromNumber  string
	Enabled     bool
	ServiceRepo ServiceRepo
	StaffRepo   StaffRepo
}

// NewTwilioSMSService creates a new Twilio SMS service
func NewTwilioSMSService(accountSid, authToken, fromNumber string, enabled bool, serviceRepo ServiceRepo, staffRepo StaffRepo) *TwilioSMSService {
	var client *twilio.RestClient
	if enabled && accountSid != "" && authToken != "" {
		client = twilio.NewRestClientWithParams(twilio.ClientParams{
			Username: accountSid,
			Password: authToken,
		})
	}

	return &TwilioSMSService{
		Client:      client,
		FromNumber:  fromNumber,
		Enabled:     enabled,
		ServiceRepo: serviceRepo,
		StaffRepo:   staffRepo,
	}
}

// SendReservationConfirmation sends an SMS confirmation for a reservation
func (s *TwilioSMSService) SendReservationConfirmation(reservation *Reservation) error {
	if !s.Enabled || s.Client == nil {
		// SMS disabled or not configured - skip silently
		return nil
	}

	if reservation.CustomerPhone == "" {
		return fmt.Errorf("customer phone number is missing")
	}

	// Resolve service and staff names by IDs; if lookup fails, fallback to IDs
	serviceName := reservation.ServiceId
	staffName := reservation.StaffId

	if s.ServiceRepo != nil {
		if services, err := s.ServiceRepo.GetServices(); err == nil {
			for _, svc := range services {
				if svc.Id == reservation.ServiceId {
					serviceName = svc.NameKey
					break
				}
			}
		}
	}

	if s.StaffRepo != nil {
		if staffList, err := s.StaffRepo.GetStaff(); err == nil {
			for _, st := range staffList {
				if st.Id == reservation.StaffId {
					staffName = st.Name
					break
				}
			}
		}
	}

	// Format the message using names
	message := fmt.Sprintf(
		"Reservation Confirmed!\nService: %s by %s\nFor: %s\nDate: %s\n\nThank you for booking with us!\nDreamPoS",
		serviceName,
		staffName,
		reservation.CustomerName,
		reservation.Datetime.Format("2006-01-02 15:04"),
	)

	params := &openapi.CreateMessageParams{}
	params.SetTo(reservation.CustomerPhone)
	params.SetFrom(s.FromNumber)
	params.SetBody(message)

	_, err := s.Client.Api.CreateMessage(params)
	if err != nil {
		return fmt.Errorf("failed to send SMS: %w", err)
	}

	return nil
}

// MockSMSService is a mock implementation for testing/development
type MockSMSService struct{}

// SendReservationConfirmation just logs that it would send an SMS
func (m *MockSMSService) SendReservationConfirmation(reservation *Reservation) error {
	// In development, just log instead of actually sending
	fmt.Printf("[SMS] Would send confirmation to %s for reservation %s\n",
		reservation.CustomerPhone, reservation.Id)
	return nil
}
