package app

import (
	"dreampos/internal/auth"
	"dreampos/internal/config"
	"dreampos/internal/data"
	"dreampos/internal/order"
	"dreampos/internal/reservation"
	"dreampos/internal/payment"
	"encoding/json"
	"fmt"
	"time"

	"net/http"

	"github.com/go-chi/chi/v5"
)

func setupAuth(router *chi.Mux, config config.Config) *auth.AuthController {
	c := &auth.AuthController{
		SessionTokenDuration: time.Hour * 24,
		CsrfTokenDuration:    time.Hour * 24,

		AuthService: auth.AuthService{
			TokenService: auth.TokenService{
				JwtSecret: []byte(config.JwtSecret),
			},
			// TODO: not hardcoded
			SessionTokenName: "SESSION-TOKEN",
			CsrfTokenName:    "X-XSRF-TOKEN",

			UserRepo: 			data.MustCreatePostgresDb(config),
		},
	}

	router.Mount("/auth", c.Routes())

	return c
}

func setupApiRoutes(router *chi.Mux, config config.Config, authMiddleware func(http.Handler)http.Handler) {
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

	{
		c := order.OrderController{
			OrderRepo: 	 data.MustCreatePostgresDb(config),
			ProductRepo: data.MustCreatePostgresDb(config),
		}

		apiRouter.With(authMiddleware).Mount("/order", c.Routes())
	}

	{
		r := reservation.ReservationController{
			ReservationRepo: 	data.NewMockDataSource(),
			ServiceRepo: 		data.NewMockDataSource(),
			StaffRepo: 			data.NewMockDataSource(),
		}

		apiRouter.Mount("/reservation", r.Routes())
	}

	router.Mount("/api", apiRouter)
}

func setupPaymentRoutes(router *chi.Mux, config config.Config, authMiddleware func(http.Handler) http.Handler) {
	// Setup payment controller with Stripe configuration
	paymentService := &payment.PaymentService{
		StripeSecretKey: config.StripeSecretKey,
		StripePublicKey: config.StripePublicKey,
		SuccessURL:      fmt.Sprintf("http://%s/payment/success", config.FrontendUrl), // When I save it automatically makes the spaces, after ':' !?
		CancelURL:       fmt.Sprintf("http://%s/payment/cancel", config.FrontendUrl),
	}

	paymentController := &payment.PaymentController{
		Service: paymentService,
	}

	// Mount payment routes with authentication
	router.Mount("/api/payment", paymentController.Routes())
}
