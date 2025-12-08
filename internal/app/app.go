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

	"github.com/gin-gonic/gin"

	"dreampos/internal/business"
	"dreampos/internal/config"
	"dreampos/internal/data"
)

type App struct {
	Server	*http.Server
}

func New(config config.Config) App {
	mainRouter := gin.Default()

	mainRouter.Use(gin.Recovery())

	{
		db, err := data.NewPostgresDb(config)
		if err != nil {
			panic(fmt.Errorf("Failed to connect to Postgres DB: %w", err))
		}

		businessController := business.BusinessController{
			Service: business.ProductionBusinessService{
				Db: db,
			},
		}
		businessGroup := mainRouter.Group("/businesses")

		businessController.Attach(businessGroup)
	}

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
			panic("Server failed: " + err.Error())
		}
	}()

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
