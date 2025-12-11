package data

import (
	"dreampos/internal/auth"
	"dreampos/internal/order"
	"slices"
	"strings"
)

type MockDataSource struct {
	Users		map[string]auth.UserDetails
	Products	[]order.Product
}

func NewMockDataSource() *MockDataSource {
	return &MockDataSource{
		Users:    usersInit,
		Products: productsInit,
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
// order.ProductRepo implimentation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (s MockDataSource) GetProducts(filter order.ProductFilter) ([]order.Product, error) {
	filteredProducts := make([]order.Product, 0, len(s.Products))
	for _, p := range s.Products {
		if filter.Category != nil && !slices.Contains(p.Categories, strings.ToLower(*filter.Category)) {
			continue;
		}
		if filter.Includes != nil && !strings.Contains(p.Name, strings.ToLower(*filter.Includes)) {
			continue;
		}

		filteredProducts = append(filteredProducts, p)
	}

	return filteredProducts, nil
}

// -------------------------------------------------------------------------------------------------
// Dummy init data ---------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Mock user data
var usersInit = map[string]auth.UserDetails{
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

// Mock product data
var productsInit = []order.Product{
	{
		ID:         "hot-coffee",
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
		ID:         "cappuccino",
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
		ID:         "iced-coffee",
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
		ID:         "iced-latte",
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
		ID:         "smoothie-berry",
		Name:       "Smoothie – Berry Blast",
		NameKey:    "products.smoothieBerry",
		BasePrice:  5.5,
		Categories: []string{"cold drinks"},
	},
	{
		ID:         "smoothie-mango",
		Name:       "Smoothie – Mango Paradise",
		NameKey:    "products.smoothieMango",
		BasePrice:  5.5,
		Categories: []string{"cold drinks"},
	},
	{
		ID:         "iced-tea",
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
		ID:         "lemonade",
		Name:       "Fresh Lemonade",
		NameKey:    "products.lemonade",
		BasePrice:  4.0,
		Categories: []string{"cold drinks"},
	},
	{
		ID:         "orange-juice",
		Name:       "Orange Juice",
		NameKey:    "products.orangeJuice",
		BasePrice:  4.25,
		Categories: []string{"cold drinks"},
	},
	{
		ID:         "chocolate-milkshake",
		Name:       "Chocolate Milkshake",
		NameKey:    "products.chocolateMilkshake",
		BasePrice:  5.75,
		Categories: []string{"cold drinks", "popular"},
	},
	{
		ID:         "caramel-frappuccino",
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
		ID:         "croissant",
		Name:       "Butter Croissant",
		NameKey:    "products.croissant",
		BasePrice:  3.0,
		Categories: []string{"pastries", "popular"},
	},
	{
		ID:         "chocolate-croissant",
		Name:       "Chocolate Croissant",
		NameKey:    "products.chocolateCroissant",
		BasePrice:  3.4,
		Categories: []string{"pastries"},
	},
	{
		ID:         "muffin-blueberry",
		Name:       "Blueberry Muffin",
		NameKey:    "products.blueberryMuffin",
		BasePrice:  2.8,
		Categories: []string{"pastries"},
	},
	{
		ID:         "cinnamon-roll",
		Name:       "Cinnamon Roll",
		NameKey:    "products.cinnamonRoll",
		BasePrice:  3.6,
		Categories: []string{"pastries"},
	},
}
