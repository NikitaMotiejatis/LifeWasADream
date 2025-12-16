package app

import (
	"dreampos/internal/auth"
	"dreampos/internal/config"
	"dreampos/internal/data"
	"dreampos/internal/order"
	"dreampos/internal/payment"
	"dreampos/internal/product"
	"dreampos/internal/refund"
	"dreampos/internal/reservation"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

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

			UserRepo: data.MustCreatePostgresDb(config),
		},
	}

	router.Mount("/auth", c.Routes())

	return c
}

func setupApiRoutes(router *chi.Mux, config config.Config, authMiddleware func(http.Handler) http.Handler, refundService refund.Service) {
	apiRouter := chi.NewRouter()
	db := data.MustCreatePostgresDb(config)

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
			OrderRepo:   db,
			ProductRepo: db,
		}

		apiRouter.With(authMiddleware).Mount("/order", c.Routes())
	}

	{
		// Create SMS service for reservations
		smsService := reservation.NewTwilioSMSService(
			config.TwilioAccountSid,
			config.TwilioAuthToken,
			config.TwilioFromNumber,
			config.TwilioEnabled,
			data.NewMockDataSource(), // ServiceRepo
			data.NewMockDataSource(), // StaffRepo
		)

		r := reservation.ReservationController{
			ReservationRepo: db,
			ServiceRepo:     db,
			StaffRepo:       db,
			SMSService:      smsService,
		}

		apiRouter.With(authMiddleware).Mount("/reservation", r.Routes())
	}

	{
		c := refund.RefundController{
			RefundRepo:    db,
			RefundService: refundService, // Pass the refund service for Stripe integration
		}

		apiRouter.With(authMiddleware).Mount("/refund", c.Routes())
	}

	{
		c := product.ProductController{
			ProductRepo: db,
		}

		apiRouter.With(authMiddleware).Mount("/product", c.Routes())
	}

	router.Mount("/api", apiRouter)
}

func setupPaymentRoutes(router *chi.Mux, config config.Config, authMiddleware func(http.Handler) http.Handler, paymentService *payment.PaymentService) {
	// Setup payment controller with Stripe configuration
	db := data.MustCreatePostgresDb(config)
	if paymentService == nil {
		paymentService = &payment.PaymentService{}
	}
	paymentService.StripeSecretKey = config.StripeSecretKey
	paymentService.StripePublicKey = config.StripePublicKey
	paymentService.SuccessURL = fmt.Sprintf("http://%s/payment/success", config.FrontendUrl)
	paymentService.CancelURL = fmt.Sprintf("http://%s/payment/cancel", config.FrontendUrl)
	paymentService.ReservationSuccessURL = fmt.Sprintf("http://%s/reservation-payment/success", config.FrontendUrl)
	paymentService.ReservationCancelURL = fmt.Sprintf("http://%s/reservation-payment/cancel", config.FrontendUrl)
	paymentService.OrderTotals = db
	paymentService.OrderStatus = db
	paymentService.PaymentRepo = db
	paymentService.OrderItems = db
	paymentService.OrderTip = db
	paymentService.ReservationTotals = db
	paymentService.ReservationStatus = db
	paymentService.ReservationItems = db

	paymentController := &payment.PaymentController{
		Service: paymentService,
	}

	// Mount payment routes
	router.Mount("/api/payment", paymentController.Routes())
}
