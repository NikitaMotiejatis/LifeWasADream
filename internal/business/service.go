package business

import (
	"errors"
	"strconv"

	"github.com/jmoiron/sqlx"
)

type BusinessService interface {
	ListBusinesses(db *sqlx.DB) ([]Business, error)
	GetBusiness(db *sqlx.DB, businessId uint32) (Business, error)
	CreateBusiness(db *sqlx.DB, business Business) error
}

// ----------------------------------------------------------------------------
// ProductionBusinessService --------------------------------------------------
// ----------------------------------------------------------------------------

type ProductionBusinessService struct {}

func (s ProductionBusinessService) ListBusinesses(db *sqlx.DB) ([]Business, error) {
	if db == nil {
		return nil, errors.New("got nil DB pointer")
	}

	businesses := []Business{}

	if err := db.Select(&businesses, "SELECT * FROM business"); err != nil {
		return nil, err
	}

	return businesses, nil
}

func (s ProductionBusinessService) GetBusiness(db *sqlx.DB, businessId uint32) (Business, error) {
	if db == nil {
		return Business{}, errors.New("got nil DB pointer")
	}

	businesses := []Business{}

	err := db.Select(&businesses, "SELECT * FROM business WHERE id = $1 LIMIT 1", businessId)
	if err != nil {
		return Business{}, err
	}

	if len(businesses) != 1 {
		return Business{}, errors.New("expexted 1 entry got " + strconv.Itoa(len(businesses)))
	}

	return businesses[0], nil
}

func (s ProductionBusinessService) CreateBusiness(db *sqlx.DB, business Business) error {
	if db == nil {
		return errors.New("got nil DB pointer")
	}

	_, err := db.NamedExec(`
		INSERT INTO business 
			(id, name, description, type, email, phone, created_at) 
			VALUES
			(:id, :name, :description, :type, :email, :phone, :created_at)`,
		business)

	return err
}
