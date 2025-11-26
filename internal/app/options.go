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
)

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

type CU struct {}
func (_ CU) Update(claims token.Claims) token.Claims {
	claims.User.SetRole("Order")
	claims.User.SetSliceAttr("role", []string{"ADMIN", "ORDER"})
	return claims
}


func authOptions(config config.Config) auth.Opts {
	secretFunc := func(id string) (string, error) {
		return config.JwtSecret, nil
	}

	cu := CU{}

	authOptions := auth.Opts{
		SecretReader: 	token.SecretFunc(secretFunc),
		ClaimsUpd: 		cu,
		TokenDuration:  time.Minute * 5,
		CookieDuration: time.Hour * 24,
		Issuer:         "dreampos",
		URL:            os.Getenv("URL"),
		AvatarStore: 	avatar.NewNoOp(),
		XSRFHeaderKey: 	config.XSRFHeaderKey,
		XSRFCookieName: config.XSRFCookieName,
		SameSiteCookie: http.SameSiteStrictMode,
		Validator:		token.ValidatorFunc(func(token string, claims token.Claims) bool {
			return true 
		}) ,
	}
	return authOptions
}

func checkCredentials(user, password string) (ok bool, err error) {
	fmt.Println("Signing in as", user, password)
	return true, nil
}
