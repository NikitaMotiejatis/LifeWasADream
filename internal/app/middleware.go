package app

import (
	"dreampos/internal/config"
	"fmt"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func attachMiddlewares(router *chi.Mux, config config.Config) {
	router.Use(middleware.Heartbeat("/ping"))

	router.Use(middleware.Recoverer)
	router.Use(middleware.CleanPath)
	router.Use(middleware.Logger)

	corsOptions := cors.Options{
		AllowedOrigins:   []string{"http://localhost:" + fmt.Sprint(config.VitePort)},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "Location", config.XSRFHeaderKey},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           60 * 5, // Seconds
	}
	router.Use(cors.Handler(corsOptions))
}
