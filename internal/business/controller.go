package business

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BusinessController struct {
	Service BusinessService
}

func (c BusinessController) Attach(rg *gin.RouterGroup) {
	rg.GET("list", c.list)
	rg.GET(":businessId", c.business)
	rg.PUT("create", c.create)
}

func (c BusinessController) list(ctx *gin.Context) {
	if ctx == nil {
		panic("controller was reached with nil context")
	}

	pageNumber, err := strconv.ParseInt(ctx.DefaultQuery("pageNumber", "0"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid page number"})
		return
	}

	pageSize, err := strconv.ParseInt(ctx.DefaultQuery("pageSize", "10"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid page size"})
		return
	}

	businesses, err := c.Service.ListBusinesses(int32(pageNumber), int32(pageSize))
	if errors.Is(err, ErrInternal) {
		ctx.Status(http.StatusInternalServerError)
		return
	} else if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, businesses)
}

func (c BusinessController) business(ctx *gin.Context) {
	if ctx == nil {
		panic("controller was reached with nil context")
	}

	businessId, err := strconv.ParseInt(ctx.Param("businessId"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	business, err := c.Service.GetBusiness(int32(businessId))
	if errors.Is(err, ErrInternal) {
		ctx.Status(http.StatusInternalServerError)
		return
	} else if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, business)
}

func (c BusinessController) create(ctx *gin.Context) {
	if ctx == nil {
		panic("controller was reached with nil context")
	}

	var business Business

	err := ctx.ShouldBindJSON(&business)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = c.Service.CreateBusiness(business)
	if errors.Is(err, ErrInternal) {
		ctx.Status(http.StatusInternalServerError)
		return
	} else if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusCreated)
}


