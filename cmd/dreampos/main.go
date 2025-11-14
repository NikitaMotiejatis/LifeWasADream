package main

import (
	"fmt"
	"log/slog"

	"github.com/jmoiron/sqlx"
	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"

	"dreampos/internal/config"
	"dreampos/internal/app"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		slog.Error("Failed to read config: " + err.Error())
		return
	}

	dbDataSource := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		config.DbHostname,
		config.DbPort,
		config.DbName,
		config.DbUser,
		config.DbPass)

	database, err := sqlx.Connect("postgres", dbDataSource)
	if err != nil {
		slog.Error("Failed to connect to DB: " + err.Error())
		return
	}

	app := app.New(config.Url, database)
	app.Start()
}
