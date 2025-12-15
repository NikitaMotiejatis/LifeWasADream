package app

import (
	"dreampos/internal/config"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func attachGlobalMiddlewares(router *chi.Mux, config config.Config) {
	router.Use(middleware.Heartbeat("/ping"))

	router.Use(middleware.Recoverer)
	router.Use(middleware.CleanPath)
	router.Use(requestLogger)

	corsOptions := cors.Options{
		AllowedOrigins:   []string{"http://localhost:" + fmt.Sprint(config.VitePort)},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "Location", config.XSRFHeaderKey},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           60 * 5, // Seconds
	}
	router.Use(cors.Handler(corsOptions))
}

// requestLogger logs HTTP requests to the configured log file
func requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapper := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

		next.ServeHTTP(wrapper, r)

		duration := time.Since(start)
		slog.Info("HTTP request",
			"method", r.Method,
			"uri", r.RequestURI,
			"status", wrapper.Status(),
			"bytes", wrapper.BytesWritten(),
			"duration", duration,
			"remote", r.RemoteAddr,
		)
	})
}
