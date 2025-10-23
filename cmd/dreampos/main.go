package main

import (
	"database/sql"
	"dreampos/internal/config"
	"dreampos/internal/server"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config: " + err.Error())
	}

	db, err := sql.Open("sqlite", "file:" + cfg.DdPath)
	if err != nil {
		log.Fatal("Failed to connect to DB: " + err.Error())
	}

	server := server.Server{
		Url: cfg.Url,
		Db:  db,
	}

	err = server.Start()
	if err != nil {
		log.Fatal("Failed to start server: " + err.Error())
	}
}
