package main

import (
	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"

	"dreampos/internal/config"
	"dreampos/internal/app"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		panic("Failed to read config: " + err.Error())
	}

	app := app.New(*config)
	app.Start()
}
