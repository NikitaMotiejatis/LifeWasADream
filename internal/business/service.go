package business

import (
	"errors"
	"log/slog"
	"math"
	"strconv"

	"github.com/jmoiron/sqlx"
)

var (
	ErrInternal			= errors.New("internal error")
	ErrInvalidParams 	= errors.New("invalid parameter(s)")
	ErrParamsTooBig 	= errors.New("parameter(s) too big")
)

type BusinessService interface {
	ListBusinesses(pageNumber, pageSize int32) ([]Business, error)
	GetBusiness(businessId int32) (Business, error)
	CreateBusiness(business Business) error
}

// ------------------------------------------------------------------------------------------------ 
// ProductionBusinessService ----------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

type ProductionBusinessService struct {
	Db *sqlx.DB
}

func (s ProductionBusinessService) ListBusinesses(pageNumber, pageSize int32) ([]Business, error) {
	if s.Db == nil {
		slog.Error("got a nil DB pointer")
		return []Business{}, ErrInternal
	}

	if pageNumber < 0 || pageSize < 1 {
		return []Business{}, ErrInvalidParams
	}

	if pageNumber > math.MaxInt32 / pageSize {
		return []Business{}, ErrParamsTooBig
	}

	const query = `
		SELECT
			id,
			name,
			description,
			type,
			email,
			phone,
			created_at
		FROM business
		OFFSET $1
		LIMIT $2
	`

	offset := pageNumber * pageSize
	businesses := []Business{}

	err := s.Db.Select(&businesses, query, offset, pageSize)
	if err != nil {
		slog.Error(err.Error())
		return nil, ErrInvalidParams
	}

	return businesses, nil
}

func (s ProductionBusinessService) GetBusiness(businessId int32) (Business, error) {
	if s.Db == nil {
		slog.Error("got a nil DB pointer")
		return Business{}, ErrInternal
	}


	const query = `
		SELECT
			id,
			name,
			description,
			type,
			email,
			phone,
			created_at
		FROM business
			WHERE id = $1 
		LIMIT 1
	`

	businesses := []Business{}

	err := s.Db.Select(&businesses, query, businessId)
	if err != nil {
		slog.Error(err.Error())
		return Business{}, ErrInvalidParams
	}

	if len(businesses) != 1 {
		slog.Error("expexted 1 entry got " + strconv.Itoa(len(businesses)))
		return Business{}, ErrInvalidParams
	}

	return businesses[0], nil
}

func (s ProductionBusinessService) CreateBusiness(business Business) error {
	if s.Db == nil {
		slog.Error("got a nil DB pointer")
		return ErrInternal
	}

	const statement = `
		INSERT INTO 
			business(id, name, description, type, email, phone, created_at) 
		VALUES
			(:id, :name, :description, :type, :email, :phone, :created_at)
	`

	_, err := s.Db.NamedExec(statement, business)
	if err != nil {
		slog.Error(err.Error())
		return ErrInvalidParams
	}

	return nil
}
