package auth

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type JwtSessionToken struct {
	Username		string	`json:"username"`
	ExpiresUnix		int64	`json:"expires"`
	CsrfToken		string	`json:"csrf-token"`
	jwt.RegisteredClaims
}


func (c AuthController) login(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	type LoginInfo struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var user LoginInfo
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	userDetails, found := c.Users[user.Username]
	if !found {
		http.Error(w, "invalid login details", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userDetails.PasswordHash), []byte(user.Password)); err != nil {
		http.Error(w, "invalid login details", http.StatusUnauthorized)
		return
	}

	sessionTokenDuration := time.Hour * 24
	csrfTokenDuration := time.Hour * 24

	var csrfToken string
	{
		bytes := make([]byte, 64)
		if _, err := rand.Read(bytes); err != nil {
			slog.Error("failed to generate CSRF token: " + err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		csrfToken = base64.URLEncoding.EncodeToString(bytes)
	}

	var sessionToken string
	{
		secretKey := []byte("secret"); // TODO: Read a better secret from config
		claims := JwtSessionToken{
			Username: user.Username, 
			ExpiresUnix: time.Now().Add(sessionTokenDuration).Unix(), 
			CsrfToken: csrfToken,
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		signedToken, err := token.SignedString(secretKey)
		if err != nil {
			slog.Error("failed to generate session token: " + err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		sessionToken = signedToken
	}

	http.SetCookie(w, &http.Cookie{
		Name:       c.SessionTokenName,
		Value:		sessionToken,
		Path:		"/",
		Expires:    time.Now().Add(sessionTokenDuration),
		HttpOnly:   true,
		SameSite:   http.SameSiteStrictMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:       c.CsrfTokenName,
		Value:      csrfToken,
		Path:		"/",
		Expires:    time.Now().Add(csrfTokenDuration),
		HttpOnly:   false,
		SameSite:   http.SameSiteStrictMode,
	})

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("/orders"))
}

func (c AuthController) validate(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	csrfToken := r.Header.Get("X-XSRF-TOKEN") // TODO: remove hard-coded header name

	sessionTokenCookie, err := r.Cookie("SESSION-TOKEN")
	if err != nil {
		http.Error(w, "not validated", http.StatusUnauthorized)
		return
	}

	{
		token, err := jwt.ParseWithClaims(sessionTokenCookie.Value, &JwtSessionToken{}, func(t *jwt.Token) (any, error) {
			return []byte("secret"), nil // TODO: secret
		})
		if err != nil || !token.Valid {
			http.Error(w, "not validated", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(*JwtSessionToken)
		if !ok {
			http.Error(w, "not validated", http.StatusUnauthorized)
			return
		}

		if time.Now().After(time.Unix(claims.ExpiresUnix, 0)) || claims.CsrfToken != csrfToken {
			http.Error(w, "not validated", http.StatusUnauthorized)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("valid credentials"))
}

func (c AuthController) logout(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:       c.SessionTokenName,
		Value:      "",
		Path: 		"/",
		Expires:    time.Now().Add(-time.Hour),
		HttpOnly:   true,
		SameSite:   http.SameSiteStrictMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:       c.CsrfTokenName,
		Value:      "",
		Path: 		"/",
		Expires:    time.Now().Add(-time.Hour),
		HttpOnly:   false,
		SameSite:   http.SameSiteStrictMode,
	})

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("logout successfull"))
}
