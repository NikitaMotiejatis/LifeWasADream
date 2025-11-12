package app

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"dreampos/internal/business"
)

type App struct {
	Db  	*sqlx.DB
	Server	*http.Server
}

func New(url string, db *sqlx.DB) App {
	mainRouter := gin.Default()

	mainRouter.Use(gin.Recovery())

	{
		businessController := business.BusinessController{
			Service: business.ProductionBusinessService{
				Db: db,
			},
		}
		businessGroup := mainRouter.Group("/businesses")

		businessController.Attach(businessGroup)
	}

	return App{
		Db:     db,
		Server: &http.Server{
			Addr:    url,
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
