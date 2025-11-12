package server

import (
	"github.com/fvbock/endless"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"dreampos/internal/business"
)

type Server struct {
	Url string
	Db  *sqlx.DB
}

func (server *Server) Start() {
	mainRouter := gin.Default()

	mainRouter.Use(gin.Recovery())

	{
		businessController := business.BusinessController{
			Service: business.ProductionBusinessService{
				Db: server.Db,
			},
		}
		businessGroup := mainRouter.Group("/businesses")

		businessController.Attach(businessGroup)
	}

	err := endless.ListenAndServe(server.Url, mainRouter)
	if err != nil {
		panic(err.Error())
	}
}
