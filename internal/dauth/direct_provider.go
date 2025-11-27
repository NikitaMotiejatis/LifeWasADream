package dauth

import "github.com/go-pkgz/auth/v2/token"

type DirectProvider interface {
	Update(claims token.Claims) token.Claims
	CheckCredentials(user, password string) (ok bool, err error)
}
