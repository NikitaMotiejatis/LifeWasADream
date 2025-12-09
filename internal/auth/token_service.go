package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenService struct {
	JwtSecret []byte
}

var (
	ErrTokenNotValid 		= errors.New("token not valid")
	ErrTokenWrongStructure	= fmt.Errorf("%w: wrong JWT claim structure", ErrTokenNotValid)
	ErrTokenExpired			= fmt.Errorf("%w: token expired", ErrTokenNotValid)
	ErrTokenInvalidCsrf		= fmt.Errorf("%w: invalid token csrf", ErrTokenNotValid)
)

type JwtSessionToken struct {
	Username		string	`json:"username"`
	ExpiresUnix		int64	`json:"expires"`
	CsrfToken		string	`json:"csrf-token"`
	jwt.RegisteredClaims
}

func (s TokenService) generateSessionToken(claims jwt.Claims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString(s.JwtSecret)
	if err != nil {
		return "", fmt.Errorf("failed to generate session token: %w", err)
	}

	return signedToken, nil
}

func (s TokenService) generateCsrfToken(tokenLength uint16) (string, error) {
	bytes := make([]byte, tokenLength)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate CSRF token: %w", err)
	}

	return base64.URLEncoding.EncodeToString(bytes), nil
}

func (s TokenService) verifyAndParseSessionToken(tokenString string, csrfToken string) (*JwtSessionToken, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JwtSessionToken{}, func(t *jwt.Token) (any, error) {
		return s.JwtSecret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to parse session token: %w", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("%w: wrong secret", ErrTokenNotValid)
	}

	claims, ok := token.Claims.(*JwtSessionToken)
	if !ok {
		return nil, ErrTokenWrongStructure
	}

	if expires := time.Unix(claims.ExpiresUnix, 0);  time.Now().After(expires) {
		return nil, ErrTokenExpired
	}

	if claims.CsrfToken != csrfToken {
		return nil, ErrTokenInvalidCsrf
	}

	return claims, nil
}
