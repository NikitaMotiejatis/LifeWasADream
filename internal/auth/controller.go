package auth

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type UserDetails struct {
	PasswordHash 	string
	Roles			[]string
}

type UserRepo interface {
	GetUserDetails(username string) (UserDetails, error)
}

type AuthController struct {
	SessionTokenDuration	time.Duration
	CsrfTokenDuration 		time.Duration
	AuthService				AuthService
}

func (c AuthController) Routes() http.Handler {
	routes := chi.NewRouter()

	routes.Post("/login", c.login)
	routes.Put("/validate", c.validate)
	routes.Post("/logout", c.logout)

	return routes
}

func (c AuthController) AuthenticateMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if w == nil || r == nil {
			return
		}

		sessionTokenCookie, err := r.Cookie(c.AuthService.SessionTokenName)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		csrfToken := r.Header.Get(c.AuthService.CsrfTokenName)

		err = c.AuthService.validate(sessionTokenCookie.Value, csrfToken)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}

