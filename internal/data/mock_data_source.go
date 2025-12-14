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
	Users			map[string]auth.UserDetails
	Orders			[]order.OrderSummary
	Products		[]order.Product
	Reservations 	[]reservation.Reservation
	Services 		[]reservation.Service
	Staff 			[]reservation.Staff
}

func NewMockDataSource() *MockDataSource {
	return &MockDataSource{
		Users:    		mockUsers,
		Orders:   		mockOrders,
		Products: 		mockProducts,
		Reservations: 	mockReservations,
		Services: 		mockServices,
		Staff:			mockStaff,
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
		case "open": 			counts.Open += 1
		case "closed": 			counts.Closed += 1
		case "refund_pending": 	counts.RefundPending += 1
		case "refunded": 		counts.Refunded += 1
		}
	}

	return counts, nil
}

func (s MockDataSource) GetOrderItems(orderId int32) ([]order.Item, error) {
	return []order.Item{
		{
			Product: s.Products[0],
			SelectedVariations: []order.Variation{},
			Quantity: 5,
		},
		{
			Product: s.Products[0],
			SelectedVariations: []order.Variation{
				{
					Name:          "Large",
					NameKey:       "large",
					PriceModifier: 2,
				},
			},
			Quantity: 1,
		},
		{
			Product: s.Products[1],
			SelectedVariations: []order.Variation{},
			Quantity: 3,
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
		Id:         "hot-coffee",
		Name:       "Hot Coffee",
		NameKey:    "products.hotCoffee",
		BasePrice:  3.5,
		Categories: []string{"hot drinks", "popular"},
		Variations: []order.Variation{
			{Name: "Small", NameKey: "variations.small", PriceModifier: 0},
			{Name: "Large", NameKey: "variations.large", PriceModifier: 0.8},
		},
	},
	{
		Id:         "cappuccino",
		Name:       "Cappuccino",
		NameKey:    "products.cappuccino",
		BasePrice:  4.5,
		Categories: []string{"hot drinks"},
		Variations: []order.Variation{
			{Name: "Small", NameKey: "variations.small", PriceModifier: 0},
			{Name: "Large", NameKey: "variations.large", PriceModifier: 0.8},
		},
	},
	{
		Id:         "iced-coffee",
		Name:       "Iced Coffee",
		NameKey:    "products.icedCoffee",
		BasePrice:  4.5,
		Categories: []string{"cold drinks", "popular"},
		Variations: []order.Variation{
			{Name: "Small", NameKey: "variations.small", PriceModifier: 0},
			{Name: "Medium", NameKey: "variations.medium", PriceModifier: 0.5},
			{Name: "Large", NameKey: "variations.large", PriceModifier: 1.0},
			{Name: "Oat Milk", NameKey: "variations.oatMilk", PriceModifier: 0.6},
			{Name: "Almond Milk", NameKey: "variations.almondMilk", PriceModifier: 0.7},
		},
	},
	{
		Id:         "iced-latte",
		Name:       "Iced Latte",
		NameKey:    "products.icedLatte",
		BasePrice:  5.0,
		Categories: []string{"cold drinks"},
		Variations: []order.Variation{
			{Name: "Small", NameKey: "variations.small", PriceModifier: 0},
			{Name: "Medium", NameKey: "variations.medium", PriceModifier: 0.5},
			{Name: "Large", NameKey: "variations.large", PriceModifier: 1.0},
			{Name: "Oat Milk", NameKey: "variations.oatMilk", PriceModifier: 0.6},
			{Name: "Almond Milk", NameKey: "variations.almondMilk", PriceModifier: 0.7},
		},
	},
	{
		Id:         "smoothie-berry",
		Name:       "Smoothie – Berry Blast",
		NameKey:    "products.smoothieBerry",
		BasePrice:  5.5,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         "smoothie-mango",
		Name:       "Smoothie – Mango Paradise",
		NameKey:    "products.smoothieMango",
		BasePrice:  5.5,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         "iced-tea",
		Name:       "Iced Tea",
		NameKey:    "products.icedTea",
		BasePrice:  3.5,
		Categories: []string{"cold drinks"},
		Variations: []order.Variation{
			{Name: "Small", NameKey: "variations.small", PriceModifier: 0},
			{Name: "Large", NameKey: "variations.large", PriceModifier: 0.8},
		},
	},
	{
		Id:         "lemonade",
		Name:       "Fresh Lemonade",
		NameKey:    "products.lemonade",
		BasePrice:  4.0,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         "orange-juice",
		Name:       "Orange Juice",
		NameKey:    "products.orangeJuice",
		BasePrice:  4.25,
		Categories: []string{"cold drinks"},
	},
	{
		Id:         "chocolate-milkshake",
		Name:       "Chocolate Milkshake",
		NameKey:    "products.chocolateMilkshake",
		BasePrice:  5.75,
		Categories: []string{"cold drinks", "popular"},
	},
	{
		Id:         "caramel-frappuccino",
		Name:       "Caramel Frappuccino",
		NameKey:    "products.caramelFrappuccino",
		BasePrice:  5.5,
		Categories: []string{"cold drinks"},
		Variations: []order.Variation{
			{Name: "Small", NameKey: "variations.small", PriceModifier: 0},
			{Name: "Large", NameKey: "variations.large", PriceModifier: 0.8},
		},
	},
	{
		Id:         "croissant",
		Name:       "Butter Croissant",
		NameKey:    "products.croissant",
		BasePrice:  3.0,
		Categories: []string{"pastries", "popular"},
	},
	{
		Id:         "chocolate-croissant",
		Name:       "Chocolate Croissant",
		NameKey:    "products.chocolateCroissant",
		BasePrice:  3.4,
		Categories: []string{"pastries"},
	},
	{
		Id:         "muffin-blueberry",
		Name:       "Blueberry Muffin",
		NameKey:    "products.blueberryMuffin",
		BasePrice:  2.8,
		Categories: []string{"pastries"},
	},
	{
		Id:         "cinnamon-roll",
		Name:       "Cinnamon Roll",
		NameKey:    "products.cinnamonRoll",
		BasePrice:  3.6,
		Categories: []string{"pastries"},
	},
}

var mockReservations = []reservation.Reservation{
	{
		Id:           "RES-301",
		CustomerName: "Emma Wilson",
		CustomerPhone: "+1234567890",
		StaffId:        "2",
		ServiceId:      "1",
		Datetime:     mustParseTimeUTC("2025-11-28T10:00:00"),
		Status:       "completed",
	},
	{
		Id:           "RES-302",
		CustomerName: "Liam Chen",
		CustomerPhone: "+1987654321",
		StaffId:        "1",
		ServiceId:      "3",
		Datetime:     mustParseTimeUTC("2025-11-30T14:30:00"),
		Status:       "pending",
	},
	{
		Id:           "RES-303",
		CustomerName: "Sophia Kim",
		CustomerPhone: "+1555123456",
		StaffId:        "3",
		ServiceId:      "4",
		Datetime:     mustParseTimeUTC("2025-12-20T11:00:00"),
		Status:       "pending",
	},
	{
		Id:           "RES-304",
		CustomerName: "Noah Park",
		CustomerPhone: "+1443123456",
		StaffId:        "2",
		ServiceId:      "2",
		Datetime:     mustParseTimeUTC("2025-12-18T16:00:00"),
		Status:       "cancelled",
	},
	{
		Id:           "RES-305",
		CustomerName: "Ava Brown",
		CustomerPhone: "+1333444555",
		StaffId:        "1",
		ServiceId:      "1",
		Datetime:     mustParseTimeUTC("2025-11-20T09:30:00"),
		Status:       "no_show",
	},
}

var mockServices = []reservation.Service{
    {Id: "1", NameKey: "Haircut & Style", Price: 65, Duration: 60},
    {Id: "2", NameKey: "Hair Color", Price: 120, Duration: 120},
    {Id: "3", NameKey: "Manicure", Price: 35, Duration: 45},
    {Id: "4", NameKey: "Pedicure", Price: 50, Duration: 60},
}

var mockStaff = []reservation.Staff{
	{Id: "1", Name: "Anyone", Role: "Any", Services: []string{"1","2","3","4"}},
    {Id: "2", Name: "James Chen", Role: "Colorist", Services: []string{"1","2"}},
    {Id: "3", Name: "Sarah Johnson", Role: "Nail Technician", Services: []string{"3"}},
}
