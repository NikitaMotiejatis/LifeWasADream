package server

import (
	"dreampos/internal/business"

	"github.com/fvbock/endless"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Server struct {
	Url string
	Db  *sqlx.DB
}

func (server *Server) Start() error {
	mainRouter := gin.Default()

	mainRouter.Use(gin.Recovery())

	{
		businessController := business.BusinessController{
			Service: business.ProductionBusinessService{},
			Db:	server.Db,
		}
		businessGroup := mainRouter.Group("/businesses")

		businessController.Attach(businessGroup)
	}

	return endless.ListenAndServe(server.Url, mainRouter)
}
