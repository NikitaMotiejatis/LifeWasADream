package auth

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"
)


func (c AuthController) login(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	var user LoginInfo
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	sessionToken, csrfToken, response, err := c.AuthService.login(user, c.SessionTokenDuration)
	if errors.Is(err, ErrTokenGenerationFailed) {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	} else if err != nil {
		http.Error(w, "invalid login info", http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:       c.AuthService.SessionTokenName,
		Value:		sessionToken,
		Path:		"/",
		Expires:    time.Now().Add(c.SessionTokenDuration),
		HttpOnly:   true,
		SameSite:   http.SameSiteStrictMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:       c.AuthService.CsrfTokenName,
		Value:      csrfToken,
		Path:		"/",
		Expires:    time.Now().Add(c.CsrfTokenDuration),
		HttpOnly:   false,
		SameSite:   http.SameSiteStrictMode,
	})
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (c AuthController) validate(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	sessionTokenCookie, err := r.Cookie(c.AuthService.SessionTokenName)
	if err != nil {
		http.Error(w, "not validated", http.StatusUnauthorized)
		return
	}
	csrfToken := r.Header.Get(c.AuthService.CsrfTokenName)

	err = c.AuthService.validate(sessionTokenCookie.Value, csrfToken)
	if err != nil {
		http.Error(w, "not validated", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("valid credentials"))
}

func (c AuthController) logout(w http.ResponseWriter, r *http.Request) {
	if w == nil || r == nil {
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:       c.AuthService.SessionTokenName,
		Value:      "",
		Path: 		"/",
		Expires:    time.Now().Add(-time.Hour),
		HttpOnly:   true,
		SameSite:   http.SameSiteStrictMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:       c.AuthService.CsrfTokenName,
		Value:      "",
		Path: 		"/",
		Expires:    time.Now().Add(-time.Hour),
		HttpOnly:   false,
		SameSite:   http.SameSiteStrictMode,
	})

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("logout successfull"))
}
