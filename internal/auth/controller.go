package auth

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type UserDetails struct {
	PasswordHash 	string
	Roles			[]string
}

type UserRepo interface {
	GetUserDetails(username string) (UserDetails, error)
}

type AuthService interface {
}

type AuthController struct {
	SessionTokenName	string
	CsrfTokenName		string
	UserRepo			UserRepo
	Users 				map[string]UserDetails
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

		_, err := r.Cookie(c.SessionTokenName)
		if err != nil {
			http.Error(w, "page not found", http.StatusNotFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}

