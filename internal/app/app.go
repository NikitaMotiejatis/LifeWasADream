package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"

	"dreampos/internal/config"
	"dreampos/internal/payment"
	"dreampos/internal/refund"
)

type App struct {
	Server *http.Server
}

func New(config config.Config) App {
	mainRouter := chi.NewRouter()

	attachGlobalMiddlewares(mainRouter, config)

	authController := setupAuth(mainRouter, config)

	// Create refund service for processing Stripe refunds
	refundService := &refund.StripeService{
		StripeSecretKey: config.StripeSecretKey,
	}

	// Create payment service for checkout sessions
	paymentService := &payment.PaymentService{
		StripeSecretKey: config.StripeSecretKey,
		StripePublicKey: config.StripePublicKey,
		SuccessURL:      fmt.Sprintf("http://%s/payment/success", config.FrontendUrl),
		CancelURL:       fmt.Sprintf("http://%s/payment/cancel", config.FrontendUrl),
	}

	setupApiRoutes(mainRouter, authController.AuthenticateMiddleware, refundService)
	setupPaymentRoutes(mainRouter, paymentService)

	mainRouter.NotFound(func(w http.ResponseWriter, r *http.Request) {
		if w == nil || r == nil {
			return
		}
		http.Error(w, "page not found", http.StatusNotFound)
	})
	mainRouter.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		if w == nil || r == nil {
			return
		}
		http.Error(w, "invalid method", http.StatusMethodNotAllowed)
	})

	return App{
		Server: &http.Server{
			Addr:    config.Url,
			Handler: mainRouter,
		},
	}
}

func (app *App) Start() {
	go func() {
		err := app.Server.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			panic(fmt.Errorf("Server failed: %w", err))
		}
	}()

	slog.Info("Server started")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	slog.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := app.Server.Shutdown(ctx)
	if err != nil {
		panic(fmt.Errorf("Server forced to shutdown: %w", err))
	}

	slog.Info("Server exiting")
}
