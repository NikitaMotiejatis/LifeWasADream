package order

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderController struct {
	Service OrderService
	Db 		*sql.DB
}

func (oc OrderController) Attach(rg *gin.RouterGroup) {
	rg.GET("/list", oc.list)
	rg.GET("/:orderId", oc.order)
}

func (oc OrderController) list(c *gin.Context) {
	orders, err := oc.Service.ListOrders(oc.Db)
	if err != nil {
		c.Status(http.StatusInternalServerError)
	}

	c.JSON(http.StatusOK, orders)
}

func (oc OrderController) order(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	orderId, err := strconv.ParseInt(c.Param("orderId"), 10, 64)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	order, err := oc.Service.GetOrder(oc.Db, orderId)
	if order == nil || err != nil {
		c.Status(http.StatusNoContent)
		return
	}

	c.JSON(http.StatusOK, *order)
}
