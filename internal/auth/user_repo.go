package auth

import "errors"

var ErrUserNotFound = errors.New("unknown username")

type UserRepo interface {
	GetUserDetails(username string) (UserDetails, error)
}
