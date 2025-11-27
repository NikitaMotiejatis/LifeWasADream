package app

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/cors"
	"github.com/go-pkgz/auth/v2"
	"github.com/go-pkgz/auth/v2/avatar"
	"github.com/go-pkgz/auth/v2/token"

	"dreampos/internal/config"
	"dreampos/internal/dauth"
)

var MockProvider = dauth.InMemoryProvider{
	Users: map[string]dauth.UserDetails{
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

func corsOptions(config config.Config) cors.Options {
	corsOptions := cors.Options{
		AllowedOrigins:   []string{"http://localhost:" + fmt.Sprint(config.VitePort)},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", config.XSRFHeaderKey},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           60 * 5, // Seconds
	}
	return corsOptions
}

func authOptions(config config.Config) auth.Opts {
	secretFunc := func(id string) (string, error) {
		return config.JwtSecret, nil
	}

	validatorFunc := func(token string, claims token.Claims) bool {
		return claims.User != nil 
	}

	authOptions := auth.Opts{
		SecretReader: 	token.SecretFunc(secretFunc),
		ClaimsUpd: 		MockProvider,
		TokenDuration:  time.Minute * 5,
		CookieDuration: time.Hour * 24,
		Issuer:         "dreampos",
		URL:            os.Getenv("URL"),
		AvatarStore: 	avatar.NewNoOp(),
		XSRFHeaderKey: 	config.XSRFHeaderKey,
		XSRFCookieName: config.XSRFCookieName,
		SameSiteCookie: http.SameSiteStrictMode,
		Validator:		token.ValidatorFunc(validatorFunc),
	}
	return authOptions
}
