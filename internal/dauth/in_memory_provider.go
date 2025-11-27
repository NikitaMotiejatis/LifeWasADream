package dauth

import (
	"errors"
	"log/slog"

	"github.com/go-pkgz/auth/v2/token"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

type UserDetails struct {
	PasswordHash 	string
	Roles			[]string
}

type InMemoryProvider struct {
	Users map[string]UserDetails
}


func (p InMemoryProvider) Update(claims token.Claims) token.Claims {
	if claims.User == nil {
		slog.Error("pointer to user in claims is nil")
		return claims
	}

	userDetails, ok := p.Users[claims.User.Name]
	if !ok {
		slog.Warn("claims contain unknown user")
		return claims
	}

	claims.User.SetSliceAttr("roles", userDetails.Roles)

	return claims
}

func (p InMemoryProvider) CheckCredentials(user, password string) (ok bool, err error) {
	userDetails, ok := p.Users[user]
	if !ok {
		return false, ErrUserNotFound
	}

	err = bcrypt.CompareHashAndPassword([]byte(userDetails.PasswordHash), []byte(password))
	if err != nil {
		return false, ErrUserNotFound
	}

	return true, nil
}
