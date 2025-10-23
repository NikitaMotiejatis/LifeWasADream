package server

import (
	"dreampos/internal/order"

	"database/sql"

	"github.com/gin-gonic/gin"
)

type Server struct {
	Url string
	Db  *sql.DB
}

func (server *Server) Start() error {
	mainRouter := gin.Default()

	{
		orderController := order.OrderController{
			Service: order.ProductionOrderService{},
			Db:      server.Db,
		}
		orderGroup := mainRouter.Group("/order")

		orderController.Attach(orderGroup)
	}

	err := mainRouter.Run(server.Url)

	return err
}
