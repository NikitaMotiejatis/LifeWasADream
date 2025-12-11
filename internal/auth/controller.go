package auth

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

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

		sessionToken, err := c.AuthService.TokenService.parseSessionToken(sessionTokenCookie.Value)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		err = c.AuthService.TokenService.verifySessionToken(sessionToken, csrfToken)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		user, err := c.AuthService.getUserDetails(sessionToken)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		userContext := context.WithValue(r.Context(), "user", user)

		next.ServeHTTP(w, r.WithContext(userContext))
	})
}

