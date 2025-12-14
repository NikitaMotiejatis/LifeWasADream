package data

import (
	"dreampos/internal/auth"
	"dreampos/internal/order"
	"dreampos/internal/reservation"
	"fmt"
	"slices"
	"strings"
	"time"
)

type MockDataSource struct {
	Users        map[string]auth.UserDetails
	Orders       []order.OrderSummary
	Products     []order.Product
	Reservations []reservation.Reservation
	Services     []reservation.Service
	Staff        []reservation.Staff
}

func NewMockDataSource() *MockDataSource {
	return &MockDataSource{
		Users:        mockUsers,
		Orders:       mockOrders,
		Products:     mockProducts,
		Reservations: mockReservations,
		Services:     mockServices,
		Staff:        mockStaff,
	}
}

// -------------------------------------------------------------------------------------------------
// auth.UserRepo implimentation --------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (s MockDataSource) GetUserDetails(username string) (auth.UserDetails, error) {
	userDetails, found := s.Users[username]
	if !found {
		return auth.UserDetails{}, auth.ErrUserNotFound
	}

	return userDetails, nil
}

// -------------------------------------------------------------------------------------------------
// order.OrderRepo implimentation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (s MockDataSource) GetOrders(filter order.OrderFilter) ([]order.OrderSummary, error) {
	orders := make([]order.OrderSummary, 0, len(mockOrders))
	for _, o := range mockOrders {
		if filter.OrderStatus != nil && o.Status != *filter.OrderStatus {
			continue
		}
		if filter.From != nil && o.CreatedAt.Before(*filter.From) {
			continue
		}
		if filter.To != nil && o.CreatedAt.After(*filter.To) {
			continue
		}

		orders = append(orders, o)
	}

	return orders, nil
}

func (s MockDataSource) GetOrderCounts(filter order.OrderFilter) (order.OrderCounts, error) {
	counts := order.OrderCounts{}
	for _, o := range s.Orders {
		if filter.From != nil && o.CreatedAt.Before(*filter.From) {
			continue
		}
		if filter.To != nil && o.CreatedAt.After(*filter.To) {
			continue
		}

		counts.All += 1
		switch o.Status {
		case "open":
			counts.Open += 1
		case "closed":
			counts.Closed += 1
		case "refund_pending":
			counts.RefundPending += 1
		case "refunded":
			counts.Refunded += 1
		}
	}

	return counts, nil
}

func (s MockDataSource) GetOrderItems(orderId int32) ([]order.Item, error) {
	return []order.Item{
		{
			Product:            s.Products[0],
			SelectedVariations: []order.Variation{},
			Quantity:           5,
		},
		{
			Product: s.Products[0],
			SelectedVariations: []order.Variation{
				{
					Name:          "Large",
					PriceModifier: 200,
				},
			},
			Quantity: 1,
		},
		{
			Product:            s.Products[1],
			SelectedVariations: []order.Variation{},
			Quantity:           3,
		},
	}, nil
}

// -------------------------------------------------------------------------------------------------
// order.ProductRepo implimentation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (s MockDataSource) GetProducts(filter order.ProductFilter) ([]order.Product, error) {
	filteredProducts := make([]order.Product, 0, len(s.Products))
	for _, p := range s.Products {
		if filter.Category != nil && !slices.Contains(p.Categories, strings.ToLower(*filter.Category)) {
			continue
		}
		if filter.Includes != nil && !strings.Contains(p.Name, strings.ToLower(*filter.Includes)) {
			continue
		}

		filteredProducts = append(filteredProducts, p)
	}

	return filteredProducts, nil
}

// -------------------------------------------------------------------------------------------------
// reservation.ReservationRepo implementation
// -------------------------------------------------------------------------------------------------
func (s *MockDataSource) GetReservations(filter reservation.ReservationFilter) ([]reservation.Reservation, error) {
	result := []reservation.Reservation{}
	for _, r := range s.Reservations {
		if filter.Status != nil && r.Status != *filter.Status {
			continue
		}
		if filter.From != nil && r.Datetime.Before(*filter.From) {
			continue
		}
		if filter.To != nil && r.Datetime.After(*filter.To) {
			continue
		}
		if filter.Search != nil && *filter.Search != "" {
			search := strings.ToLower(*filter.Search)
			staffName := ""
			serviceName := ""

			for _, st := range s.Staff {
				if st.Id == r.StaffId {
					staffName = st.Name
					break
				}
			}
			for _, svc := range s.Services {
				if svc.Id == r.ServiceId {
					serviceName = svc.NameKey
					break
				}
			}

			if !strings.Contains(strings.ToLower(r.Id), search) &&
				!strings.Contains(strings.ToLower(r.CustomerName), search) &&
				!strings.Contains(strings.ToLower(r.CustomerPhone), search) &&
				!strings.Contains(strings.ToLower(staffName), search) &&
				!strings.Contains(strings.ToLower(serviceName), search) {
				continue
			}
		}

		result = append(result, r)
	}
	return result, nil
}

func (s *MockDataSource) GetReservationCounts(filter reservation.ReservationFilter) (reservation.ReservationCounts, error) {
	counts := reservation.ReservationCounts{}
	for _, r := range s.Reservations {
		if filter.From != nil && r.Datetime.Before(*filter.From) {
			continue
		}
		if filter.To != nil && r.Datetime.After(*filter.To) {
			continue
		}
		counts.All++
		switch r.Status {
		case "pending":
			counts.Pending++
		case "confirmed":
			counts.Confirmed++
		case "completed":
			counts.Completed++
		case "cancelled":
			counts.Cancelled++
		case "no_show":
			counts.NoShow++
		case "refund_pending":
			counts.RefundPending++
		}
	}
	return counts, nil
}

func (s *MockDataSource) GetReservationItems(reservationID int32) ([]reservation.Service, error) {
	services := []reservation.Service{}

	for _, r := range s.Reservations {

		for _, svc := range s.Services {
			if svc.Id == r.ServiceId {
				services = append(services, svc)
				break
			}
		}
	}

	return services, nil
}

func (s *MockDataSource) CreateReservation(res reservation.ReservationCreate) (int32, error) {
	newId := int32(len(s.Reservations) + 1)
	s.Reservations = append(s.Reservations, reservation.Reservation{
		Id:            fmt.Sprintf("%d", newId),
		CustomerName:  res.CustomerName,
		CustomerPhone: res.CustomerPhone,
		StaffId:       res.StaffId,
		ServiceId:     res.ServiceId,
		Datetime:      res.Datetime,
		Status:        res.Status,
	})
	return newId, nil
}

func (s *MockDataSource) UpdateReservation(id int32, res reservation.ReservationUpdate) error {
	for i := range s.Reservations {
		if s.Reservations[i].Id == fmt.Sprintf("%d", id) {
			if res.CustomerName != nil {
				s.Reservations[i].CustomerName = *res.CustomerName
			}
			if res.CustomerPhone != nil {
				s.Reservations[i].CustomerPhone = *res.CustomerPhone
			}
			if res.ServiceId != nil {
				s.Reservations[i].ServiceId = *res.ServiceId
			}
			if res.StaffId != nil {
				s.Reservations[i].StaffId = *res.StaffId
			}
			if res.Datetime != nil {
				s.Reservations[i].Datetime = *res.Datetime
			}
			if res.Status != nil {
				s.Reservations[i].Status = *res.Status
			}
			break
		}
	}
	return nil
}

// -------------------------------------------------------------------------------------------------
// reservation.ServiceRepo implementation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (s MockDataSource) GetServices() ([]reservation.Service, error) {
	return s.Services, nil
}

func (s MockDataSource) GetStaff() ([]reservation.Staff, error) {
	return s.Staff, nil
}

// -------------------------------------------------------------------------------------------------
// Dummy init data ---------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Mock user data
var mockUsers = map[string]auth.UserDetails{
	// username: cashier1, password: demo123
	"cashier1": {
		PasswordHash: "$2a$12$tcQXe081NZkwYnuGGPzLuu5aawmu6OeIAVdiDsfa7432jbQr0OTku",
		Roles:        []string{"Cashier", "Receptionist"},
	},
	// username: manager1, password: demo123
	"manager1": {
		PasswordHash: "$2a$12$FxiIjuFUjCP8WslpRtebEulIB8tXLjBnIprv5vrSm.kWoKGxybO4S",
		Roles:        []string{"Manager"},
	},
	// username: clerk1, password: demo123
	"clerk1": {
		PasswordHash: "$2a$12$Syv1Tld4YjaKgtZEvun8duLEHCql/P46msMnHSbsZ2gigp4s6MCh.",
		Roles:        []string{"Clerk"},
	},
	// username: supplier1, password: demo123
	"supplier1": {
		PasswordHash: "$2a$12$S5JrjWT2gilyFCoVBgi4A.uPpjcoU0R1DTiZaO/twzkOFNh748PGu",
		Roles:        []string{"Supplier"},
	},
}

// Helper function to safely parse a date string or panic if it fails.
func mustParseTime(dateStr string) time.Time {
	const timeLayout = "2006-01-02T15:04:05"

	t, err := time.Parse(timeLayout, dateStr)
	if err != nil {
		panic(fmt.Sprintf("Failed to parse date string '%s': %v", dateStr, err))
	}
	return t
}

func mustParseTimeUTC(s string) time.Time {
	t, err := time.Parse(time.RFC3339, s+"Z")
	if err != nil {
		panic(err)
	}
	return t.UTC()
}

var mockOrders = []order.OrderSummary{
	{
		Id:        1821, // Direct integer literal
		Total:     87.4,
		CreatedAt: mustParseTime("2025-11-25T16:45:00"),
		Status:    "open",
	},
	{
		Id:        1820,
		Total:     54.0,
		CreatedAt: mustParseTime("2025-11-25T16:30:00"),
		Status:    "open",
	},
	{
		Id:        1819,
		Total:     12.5,
		CreatedAt: mustParseTime("2025-11-25T16:20:00"),
		Status:    "open",
	},
	{
		Id:        1818,
		Total:     178.9,
		CreatedAt: mustParseTime("2025-11-25T15:55:00"),
		Status:    "open",
	},
	{
		Id:        1817,
		Total:     31.2,
		CreatedAt: mustParseTime("2025-11-25T15:10:00"),
		Status:    "closed",
	},
	{
		Id:        1816,
		Total:     92.0,
		CreatedAt: mustParseTime("2025-11-25T14:40:00"),
		Status:    "closed",
	},
	{
		Id:        1815,
		Total:     45.0,
		CreatedAt: mustParseTime("2025-11-25T13:20:00"),
		Status:    "refund_pending",
	},
}

// Mock product data
var mockProducts = []order.Product{
	{
		Id:         1,
		Name:       "Hot Coffee",
		BasePrice:  350,
		Categories: []string{"hot drinks", "popular"},
		Variations: []order.Variation{
			{Name: "Small", PriceModifier: 0},
			{Name: "Large", PriceModifier: 80},
		},
	},
	{
		Id:         2,
		Name:       "Cappuccino",
		BasePrice:  450,
		Categories: []string{"hot drinks"},
		Variations: []order.Variation{
			{Name: "Small", PriceModifier: 0},
			{Name: "Large", PriceModifier: 80},
		},
	},
	{
		Id:         3,
		Name:       "Iced Coffee",
		BasePrice:  450,
		Categories: []string{"cold drinks", "popular"},
		Variations: []order.Variation{
			{Name: "Small", PriceModifier: 0},
			{Name: "Medium", PriceModifier: 50},
			{Name: "Large", PriceModifier: 100},
			{Name: "Oat Milk", PriceModifier: 60},
			{Name: "Almond Milk", PriceModifier: 70},
		},
	},
	{
		Id:         4,
		Name:       "Iced Latte",
		BasePrice:  500,
		Categories: []string{"cold drinks"},
		Variations: []order.Variation{
			{Name: "Small", PriceModifier: 0},
			{Name: "Medium", PriceModifier: 50},
			{Name: "Large", PriceModifier: 100},
			{Name: "Oat Milk", PriceModifier: 60},
			{Name: "Almond Milk", PriceModifier: 70},
		},
	},
	{
		Id:         5,
		Name:       "Smoothie – Berry Blast",
		BasePrice:  550,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         6,
		Name:       "Smoothie – Mango Paradise",
		BasePrice:  550,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         7,
		Name:       "Iced Tea",
		BasePrice:  350,
		Categories: []string{"cold drinks"},
		Variations: []order.Variation{
			{Name: "Small", PriceModifier: 0},
			{Name: "Large", PriceModifier: 80},
		},
	},
	{
		Id:         8,
		Name:       "Fresh Lemonade",
		BasePrice:  400,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         9,
		Name:       "Orange Juice",
		BasePrice:  425,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         10,
		Name:       "Chocolate Milkshake",
		BasePrice:  575,
		Categories: []string{"cold drinks", "popular"},
	},
	{
		Id:         11,
		Name:       "Caramel Frappuccino",
		BasePrice:  550,
		Categories: []string{"cold drinks"},
		Variations: []order.Variation{
			{Name: "Small", PriceModifier: 0},
			{Name: "Large", PriceModifier: 80},
		},
	},
	{
		Id:         12,
		Name:       "Butter Croissant",
		BasePrice:  300,
		Categories: []string{"pastries", "popular"},
	},
	{
		Id:         13,
		Name:       "Chocolate Croissant",
		BasePrice:  340,
		Categories: []string{"pastries"},
	},
	{
		Id:         14,
		Name:       "Blueberry Muffin",
		BasePrice:  280,
		Categories: []string{"pastries"},
	},
	{
		Id:         15,
		Name:       "Cinnamon Roll",
		BasePrice:  360,
		Categories: []string{"pastries"},
	},
}

var mockReservations = []reservation.Reservation{
	{
		Id:            "RES-301",
		CustomerName:  "Emma Wilson",
		CustomerPhone: "+1234567890",
		StaffId:       "2",
		ServiceId:     "1",
		Datetime:      mustParseTimeUTC("2025-11-28T10:00:00"),
		Status:        "completed",
	},
	{
		Id:            "RES-302",
		CustomerName:  "Liam Chen",
		CustomerPhone: "+1987654321",
		StaffId:       "1",
		ServiceId:     "3",
		Datetime:      mustParseTimeUTC("2025-11-30T14:30:00"),
		Status:        "pending",
	},
	{
		Id:            "RES-303",
		CustomerName:  "Sophia Kim",
		CustomerPhone: "+1555123456",
		StaffId:       "3",
		ServiceId:     "4",
		Datetime:      mustParseTimeUTC("2025-12-20T11:00:00"),
		Status:        "pending",
	},
	{
		Id:            "RES-304",
		CustomerName:  "Noah Park",
		CustomerPhone: "+1443123456",
		StaffId:       "2",
		ServiceId:     "2",
		Datetime:      mustParseTimeUTC("2025-12-18T16:00:00"),
		Status:        "cancelled",
	},
	{
		Id:            "RES-305",
		CustomerName:  "Ava Brown",
		CustomerPhone: "+1333444555",
		StaffId:       "1",
		ServiceId:     "1",
		Datetime:      mustParseTimeUTC("2025-11-20T09:30:00"),
		Status:        "no_show",
	},
}

var mockServices = []reservation.Service{
	{Id: "1", NameKey: "Haircut & Style", Price: 65, Duration: 60},
	{Id: "2", NameKey: "Hair Color", Price: 120, Duration: 120},
	{Id: "3", NameKey: "Manicure", Price: 35, Duration: 45},
	{Id: "4", NameKey: "Pedicure", Price: 50, Duration: 60},
}

var mockStaff = []reservation.Staff{
	{Id: "1", Name: "Anyone", Role: "Any", Services: []string{"1", "2", "3", "4"}},
	{Id: "2", Name: "James Chen", Role: "Colorist", Services: []string{"1", "2"}},
	{Id: "3", Name: "Sarah Johnson", Role: "Nail Technician", Services: []string{"3"}},
}
