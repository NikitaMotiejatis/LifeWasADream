package app

import (
	"dreampos/internal/auth"
	"dreampos/internal/config"
	"time"

	"net/http"

	"github.com/go-chi/chi/v5"
)

func setupAuthControllers(router *chi.Mux, config config.Config) *auth.AuthController {
	c := &auth.AuthController{
		SessionTokenDuration: 	time.Hour * 24,
		CsrfTokenDuration: 		time.Hour * 24,

		AuthService: auth.AuthService{
			TokenService: auth.TokenService{
				JwtSecret: []byte(config.JwtSecret),
			},
			// TODO: not hardcoded
			SessionTokenName: "SESSION-TOKEN",
			CsrfTokenName:    "X-XSRF-TOKEN",
			Users: map[string]auth.UserDetails{
				// username: cashier1, password: demo123
				"cashier1": {
					PasswordHash: "$2a$12$tcQXe081NZkwYnuGGPzLuu5aawmu6OeIAVdiDsfa7432jbQr0OTku",
					Roles:        []string{"Cashier", "Receptionist"},
				},
				// username: manager1, password: demo123
				"manager1": {
					PasswordHash: "$2a$12$FxiIjuFUjCP8WslpRtebEulIB8tXLjBnIprv5vrSm.kWoKGxybO4S",
					Roles:        []string{"Manager"},
				},
				// username: clerk1, password: demo123
				"clerk1": {
					PasswordHash: "$2a$12$Syv1Tld4YjaKgtZEvun8duLEHCql/P46msMnHSbsZ2gigp4s6MCh.",
					Roles:        []string{"Clerk"},
				},
				// username: supplier1, password: demo123
				"supplier1": {
					PasswordHash: "$2a$12$S5JrjWT2gilyFCoVBgi4A.uPpjcoU0R1DTiZaO/twzkOFNh748PGu",
					Roles:        []string{"Supplier"},
				},
			},
		},
	}

	router.Mount("/auth", c.Routes())

	return c
}

func setupApiRoutes(router *chi.Mux, config config.Config, ac *auth.AuthController) {
	hi := func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("hello from server\n"))
	}

	apiRouter := chi.NewRouter()
	apiRouter.Get("/hi", hi)
	apiRouter.With(ac.AuthenticateMiddleware).Get("/vhi", hi)

	router.Mount("/api", apiRouter)
}
