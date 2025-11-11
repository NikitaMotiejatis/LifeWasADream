package main

import (
	"dreampos/internal/config"
	"fmt"
	"log/slog"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Business struct {
	Id			uint32 	`db:"id"`
	Name		string	`db:"name"`
	Description	string	`db:"description"`
	Type		string	`db:"type"`
	Email		string	`db:"email"`
	Phone		string	`db:"phone"`
	CreatedAt	string	`db:"created_at"`
}

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

	const minID = 18
	businesses := []Business{}
	err = db.Select(&businesses, "SELECT * FROM business WHERE id >= $1", minID)
	if err != nil {
		slog.Error(err.Error())
		return
	}

	for _, b := range businesses {
		_, _ = fmt.Println(b.Id)
		_, _ = fmt.Println(b.Name)
		_, _ = fmt.Println(b.Description)
		_, _ = fmt.Println(b.Type)
		_, _ = fmt.Println(b.Email)
		_, _ = fmt.Println(b.Phone)
		_, _ = fmt.Println(b.CreatedAt)
		_, _ = fmt.Println()
	}
}
