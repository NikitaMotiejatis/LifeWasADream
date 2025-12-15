package auth

import (
	"errors"
	"log/slog"
	"slices"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	TokenService		TokenService

	SessionTokenName	string
	CsrfTokenName		string

	UserRepo			UserRepo
	//Users 				map[string]UserDetails
}

var (
	ErrWrongPassword			= errors.New("wrong password")
	ErrTokenGenerationFailed 	= errors.New("token generation failed")
)

type LoginInfo struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserDetails struct {
	PasswordHash 	string
	Roles			[]string
}

type User struct {
	Username	string 		`json:"username"`
	Roles		[]string	`json:"roles"`
}

func (s AuthService) login(user LoginInfo, sessionTokenDuration time.Duration) (string, string, string, error) {
	userDetails, err := s.UserRepo.GetUserDetails(user.Username)
	if err != nil {
		return "", "", "", ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userDetails.PasswordHash), []byte(user.Password)); err != nil {
		return "", "", "", ErrWrongPassword
	}

	currency, err := s.UserRepo.GetUserCurrency(user.Username)
	if err != nil {
		slog.Warn("failed to get user currency, falling back to USD", "username", user.Username, "err", err)
		currency = "USD"
	}
	currency = strings.ToUpper(currency)

	csrfToken, err := s.TokenService.generateCsrfToken(64)
	if err != nil {
		slog.Error("failed to generate CSRF token: " + err.Error())
		return "", "", "", ErrTokenGenerationFailed
	}

	claims := JwtSessionToken{
		Username: 		user.Username, 
		ExpiresUnix:	time.Now().Add(sessionTokenDuration).Unix(), 
		CsrfToken:		csrfToken,
		Currency:		currency,
	}
	sessionToken, err := s.TokenService.generateSessionToken(claims)
	if err != nil {
		slog.Error("failed to generate session token: " + err.Error())
		return "", "", "", ErrTokenGenerationFailed
	}

	redirectPath := "/login"
	if slices.Contains(userDetails.Roles, "CASHIER") {
		redirectPath = "/newOrder"
	} else if slices.Contains(userDetails.Roles, "RECEPTIONIST") {
		redirectPath = "/newReservation"
	} else if slices.Contains(userDetails.Roles, "MANAGER") {
		redirectPath = "/dashboard"
	} else if slices.Contains(userDetails.Roles, "CLERK") {
		redirectPath = "/stockUpdates"
	} else if slices.Contains(userDetails.Roles, "SUPPLIER") {
		redirectPath = "/invoiceStatus"
	}

	return sessionToken, csrfToken, redirectPath, nil
}

func (s AuthService) validate(sessionCookieValue string, csrfToken string) error {
	token, err := s.TokenService.parseSessionToken(sessionCookieValue)
	if err != nil {
		slog.Error("invalid token: " + err.Error())
		return ErrTokenNotValid
	}

	err = s.TokenService.verifySessionToken(token, csrfToken)
	if err != nil {
		slog.Error("invalid credentials: " + err.Error())
		return ErrTokenNotValid
	}

	return nil
}

func (s AuthService) getUserDetails(sessionToken *JwtSessionToken) (User, error) {
	userDetails, err := s.UserRepo.GetUserDetails(sessionToken.Username)
	if err != nil {
		return User{}, ErrUserNotFound
	}

	user := User{
		Username: sessionToken.Username,
		Roles: userDetails.Roles,
	}
	return user, nil
}
