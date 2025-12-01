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
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/go-pkgz/auth/v2"
	"github.com/go-pkgz/auth/v2/provider"

	"github.com/jmoiron/sqlx"

	"dreampos/internal/config"
)

type App struct {
	Config 	*config.Config
	Db  	*sqlx.DB
	Server	*http.Server
}

func connectToDb(config config.Config) *sqlx.DB {
	dbDataSource := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		config.DbHostname,
		config.DbPort,
		config.DbName,
		config.DbUser,
		config.DbPass)

	dbConnection, err := sqlx.Connect("postgres", dbDataSource)
	if err != nil {
		panic("Failed to connect to DB: " + err.Error())
	}

	return dbConnection
}

func New(config config.Config) App {
	db := connectToDb(config)

	mainRouter := chi.NewRouter()

	mainRouter.Use(middleware.Logger)
	mainRouter.Use(middleware.Recoverer)
	mainRouter.Use(cors.Handler(corsOptions(config)))

	authService := auth.NewService(authOptions(config))

	authService.AddDirectProvider(
		"local",
		provider.CredCheckerFunc(MockProvider.CheckCredentials),
	)

	// authMiddlewareBase := authService.Middleware()

	authRoutes, _ := authService.Handlers()
	mainRouter.Mount("/auth", authRoutes)

	return App{
		Db:     db,
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
			panic("Server failed: " + err.Error())
		}
	}()

	slog.Info("Server started")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	slog.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second)
	defer cancel()

	err := app.Server.Shutdown(ctx)
	if err != nil {
		panic("Server forced to shutdown: " + err.Error())
	}

	slog.Info("Server exiting")
}
