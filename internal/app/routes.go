package app

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func attachRoutes(router *chi.Mux) {
	router.Get("/hi", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("hello from server\n"))
	})
}
