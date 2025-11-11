package main

import (
	"fmt"
	"log/slog"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"dreampos/internal/config"
	"dreampos/internal/server"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		slog.Error("Failed to read config: " + err.Error())
		return
	}

	dbDataSource := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		cfg.DbHostname,
		cfg.DbPort,
		cfg.DbName,
		cfg.DbUser,
		cfg.DbPass)

	db, err := sqlx.Connect("postgres", dbDataSource)
	if err != nil {
		slog.Error("Failed to connect to DB: " + err.Error())
		return
	}

	server := server.Server{
		Url: cfg.Url,
		Db: db,
	}

	server.Start()

	//const minID = 18
	//businesses := []business.Business{}
	//err = db.Select(&businesses, "SELECT * FROM business WHERE id >= $1", minID)
	//if err != nil {
	//	slog.Error(err.Error())
	//	return
	//}

	//for _, b := range businesses {
	//	_, _ = fmt.Println(b.PrettyString())
	//}
}
