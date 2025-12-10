package app

import (
	"dreampos/internal/auth"
	"dreampos/internal/config"
	"encoding/json"
	"time"

	"net/http"

	"github.com/go-chi/chi/v5"
)

func setupAuth(router *chi.Mux, config config.Config) *auth.AuthController {
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

func setupApiRoutes(router *chi.Mux, _config config.Config, authMiddleware func(http.Handler)http.Handler) {
	apiRouter := chi.NewRouter()

	{
		// TODO: if this becomes more complicated extract to controller
		me := func(w http.ResponseWriter, r *http.Request) {
			user, ok := r.Context().Value("user").(auth.User)
			if !ok {
				w.WriteHeader(http.StatusNotFound)
				return
			}

			w.WriteHeader(http.StatusOK)
			if err := json.NewEncoder(w).Encode(&user); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		}
		apiRouter.With(authMiddleware).Get("/me", me)
	}

	router.Mount("/api", apiRouter)
}
