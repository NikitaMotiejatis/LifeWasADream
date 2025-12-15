package auth

import "errors"

var ErrUserNotFound = errors.New("unknown username")

type UserRepo interface {
	GetUserDetails(username string) (UserDetails, error)
	GetUserCurrency(username string) (string, error)
	GetBusinessInfo(username string) (BusinessInfo, error)
}
