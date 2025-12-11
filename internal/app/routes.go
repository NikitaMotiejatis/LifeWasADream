package app

import (
	"dreampos/internal/auth"
	"dreampos/internal/config"
	"dreampos/internal/data"
	"dreampos/internal/order"
	"encoding/json"
	"time"

	"net/http"

	"github.com/go-chi/chi/v5"
)

func setupAuth(router *chi.Mux, config config.Config) *auth.AuthController {
	c := &auth.AuthController{
		SessionTokenDuration: 	time.Hour * 24,
		CsrfTokenDuration: 		time.Hour * 24,

		AuthService: auth.AuthService{
			TokenService: auth.TokenService{
				JwtSecret: []byte(config.JwtSecret),
			},
			// TODO: not hardcoded
			SessionTokenName: 	"SESSION-TOKEN",
			CsrfTokenName:    	"X-XSRF-TOKEN",

			UserRepo: 			data.NewMockDataSource(),
		},
	}

	router.Mount("/auth", c.Routes())

	return c
}

func setupApiRoutes(router *chi.Mux, _config config.Config, authMiddleware func(http.Handler)http.Handler) {
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
			OrderRepo: 	 data.NewMockDataSource(),
			ProductRepo: data.NewMockDataSource(),
		}

		apiRouter.Mount("/order", c.Routes())
	}

	router.Mount("/api", apiRouter)
}
