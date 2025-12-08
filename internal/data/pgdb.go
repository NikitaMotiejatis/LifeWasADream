package data

import (
	"fmt"

	"github.com/jmoiron/sqlx"

	"dreampos/internal/config"
)

func NewPostgresDb(config config.Config) (*sqlx.DB, error) {
	dbDataSource := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		config.DbHostname,
		config.DbPort,
		config.DbName,
		config.DbUser,
		config.DbPass)

	return sqlx.Connect("postgres", dbDataSource)
}
