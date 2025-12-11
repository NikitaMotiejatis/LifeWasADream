package main

import (
	"fmt"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"

	"dreampos/internal/config"
	"dreampos/internal/app"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		panic(fmt.Errorf("Failed to read config: %w", err))
	}

	app := app.New(*config)
	app.Start()
}
