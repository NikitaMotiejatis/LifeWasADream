package data

import (
	"fmt"

	"github.com/jmoiron/sqlx"

	"dreampos/internal/config"
)

type PostgresDb struct {
	Db *sqlx.DB
}

func MustCreatePostgresDb(config config.Config) PostgresDb {
	dbDataSource := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		config.DbHostname,
		config.DbPort,
		config.DbName,
		config.DbUser,
		config.DbPass)

	return PostgresDb{
		Db: sqlx.MustConnect("postgres", dbDataSource),
	}
}
