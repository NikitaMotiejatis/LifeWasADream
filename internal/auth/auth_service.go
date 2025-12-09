package auth

import (
	"errors"
	"log/slog"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	TokenService		TokenService

	SessionTokenName	string
	CsrfTokenName		string

	Users 				map[string]UserDetails
}

var (
	ErrUserNotFound 			= errors.New("unknown username")
	ErrWrongPassword			= errors.New("wrong password")
	ErrTokenGenerationFailed 	= errors.New("token generation failed")
)

type LoginInfo struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (s AuthService) login(user LoginInfo, sessionTokenDuration time.Duration) (string, string, error) {
	userDetails, found := s.Users[user.Username]
	if !found {
		return "", "", ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userDetails.PasswordHash), []byte(user.Password)); err != nil {
		return "", "", ErrWrongPassword
	}

	csrfToken, err := s.TokenService.generateCsrfToken(64)
	if err != nil {
		slog.Error("failed to generate CSRF token: " + err.Error())
		return "", "", ErrTokenGenerationFailed
	}

	claims := JwtSessionToken{
		Username: user.Username, 
		ExpiresUnix: time.Now().Add(sessionTokenDuration).Unix(), 
		CsrfToken: csrfToken,
	}
	sessionToken, err := s.TokenService.generateSessionToken(claims)
	if err != nil {
		slog.Error("failed to generate session token: " + err.Error())
		return "", "", ErrTokenGenerationFailed
	}

	return sessionToken, csrfToken, nil
}

func (s AuthService) validate(cookieValue string, csrfToken string) error {
	_, err := s.TokenService.verifyAndParseSessionToken(cookieValue, csrfToken)
	if err != nil {
		slog.Error("invalid credentials: " + err.Error())
		return ErrTokenNotValid
	}

	return nil
}
