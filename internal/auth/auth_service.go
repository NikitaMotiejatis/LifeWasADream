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
}

var (
	ErrBadParams				= errors.New("bad parameters")
	ErrWrongPassword			= errors.New("wrong password")
	ErrTokenGenerationFailed 	= errors.New("token generation failed")
)

func (s AuthService) login(user LoginInfo, sessionTokenDuration time.Duration) (string, string, LoginResponse, error) {
	userDetails, err := s.UserRepo.GetUserDetails(user.Username)
	if err != nil {
		return "", "", LoginResponse{}, ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userDetails.PasswordHash), []byte(user.Password)); err != nil {
		return "", "", LoginResponse{}, ErrWrongPassword
	}

	csrfToken, err := s.TokenService.generateCsrfToken(64)
	if err != nil {
		slog.Error("failed to generate CSRF token: " + err.Error())
		return "", "", LoginResponse{}, ErrTokenGenerationFailed
	}

	claims := JwtSessionToken{
		Username: 		user.Username, 
		ExpiresUnix:	time.Now().Add(sessionTokenDuration).Unix(), 
		CsrfToken:		csrfToken,
	}
	sessionToken, err := s.TokenService.generateSessionToken(claims)
	if err != nil {
		slog.Error("failed to generate session token: " + err.Error())
		return "", "", LoginResponse{}, ErrTokenGenerationFailed
	}

	var response LoginResponse

	response.Currency, err = s.UserRepo.GetUserCurrency(user.Username)
	if err != nil {
		slog.Warn("failed to get user currency, falling back to USD", "username", user.Username, "err", err)
		response.Currency = "USD"
	}
	response.Currency = strings.ToUpper(response.Currency)

	response.RedirectPath = "/login"
	if slices.Contains(userDetails.Roles, "CASHIER") {
		response.RedirectPath = "/newOrder"
	} else if slices.Contains(userDetails.Roles, "RECEPTIONIST") {
		response.RedirectPath = "/newReservation"
	} else if slices.Contains(userDetails.Roles, "MANAGER") {
		response.RedirectPath = "/dashboard"
	} else if slices.Contains(userDetails.Roles, "CLERK") {
		response.RedirectPath = "/stockUpdates"
	} else if slices.Contains(userDetails.Roles, "SUPPLIER") {
		response.RedirectPath = "/invoiceStatus"
	}

	response.BusinessInfo, err = s.UserRepo.GetBusinessInfo(user.Username)
	if err != nil {
		slog.Error(err.Error())
		return "", "", LoginResponse{}, ErrBadParams
	}

	return sessionToken, csrfToken, response, nil
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
