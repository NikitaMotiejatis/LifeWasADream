// TODO: Better error handeling


package business

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type BusinessController struct {
	Service BusinessService
	Db		*sqlx.DB
}

func (c BusinessController) Attach(rg *gin.RouterGroup) {
	rg.GET("list", c.list)
	rg.GET(":businessId", c.business)
	rg.PUT("create", c.create)
}

func (c BusinessController) list(ctx *gin.Context) {
	if ctx == nil {
		slog.Warn("controller was reached with nil context")
		return
	}

	businesses, err := c.Service.ListBusinesses(c.Db)
	if err != nil {
		slog.Warn(err.Error())
		ctx.Status(http.StatusInternalServerError)
		return
	}

	ctx.JSON(http.StatusOK, businesses)
}

// TODO: pagination
func (c BusinessController) business(ctx *gin.Context) {
	if ctx == nil {
		slog.Warn("controller was reached with nil context")
		return
	}

	businessId, err := strconv.ParseInt(ctx.Param("businessId"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	business, err := c.Service.GetBusiness(c.Db, uint32(businessId))
	if err != nil {
		slog.Warn(err.Error())
		ctx.Status(http.StatusInternalServerError)
		return
	}

	ctx.JSON(http.StatusOK, business)
}

func (c BusinessController) create(ctx *gin.Context) {
	if ctx == nil {
		slog.Warn("controller was reached with nil context")
		return
	}

	var business Business

	err := ctx.ShouldBindJSON(&business)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = c.Service.CreateBusiness(c.Db, business)
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		return
	}

	ctx.Status(http.StatusCreated)
}


