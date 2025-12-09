package app

import (
	"dreampos/internal/auth"
	"dreampos/internal/config"

	"net/http"

	"github.com/go-chi/chi/v5"
)

func attachRoutes(router *chi.Mux, config config.Config) {
	router.Get("/hi", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("hello from server\n"))
	})

	c := auth.AuthController{
		SessionTokenName: 	"SESSION-TOKEN",
		CsrfTokenName: 		"X-XSRF-TOKEN",

		Users: map[string]auth.UserDetails{
		// username: cashier1, password: demo123
		"cashier1": { 
			PasswordHash: 	"$2a$12$tcQXe081NZkwYnuGGPzLuu5aawmu6OeIAVdiDsfa7432jbQr0OTku",
			Roles: 			[]string{ "Cashier", "Receptionist" },
		},
		// username: manager1, password: demo123
		"manager1": { 
			PasswordHash: 	"$2a$12$FxiIjuFUjCP8WslpRtebEulIB8tXLjBnIprv5vrSm.kWoKGxybO4S",
			Roles: 			[]string{ "Manager" },
		},
		// username: clerk1, password: demo123
		"clerk1": { 
			PasswordHash:	"$2a$12$Syv1Tld4YjaKgtZEvun8duLEHCql/P46msMnHSbsZ2gigp4s6MCh.",
			Roles: 			[]string{ "Clerk" },
		},
		// username: supplier1, password: demo123
		"supplier1": { 
			PasswordHash: 	"$2a$12$S5JrjWT2gilyFCoVBgi4A.uPpjcoU0R1DTiZaO/twzkOFNh748PGu",
			Roles: 			[]string{ "Supplier" },
		},
	},

	}
	router.Mount("/auth", c.Routes())
}
