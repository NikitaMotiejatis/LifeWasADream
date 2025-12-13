package main

import (
	"fmt"
	"log/slog"
	"os"
	"time"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"

	"dreampos/internal/app"
	"dreampos/internal/config"
)

func main() {
	if err := os.MkdirAll("logs", 0755); err != nil {
        slog.Error("Failed to create logs directory", "error", err)
        os.Exit(1)
    }

	logFileName := fmt.Sprintf("logs/dreampos_%s.log", time.Now().Format("2006-01-02"))
    logFile, err := os.OpenFile(logFileName, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
    if err != nil {
        slog.Error("Failed to open log file", "error", err)
        os.Exit(1)
    }
    defer logFile.Close()

	// Configure slog with JSON handler for structured logging
	logger := slog.New(slog.NewJSONHandler(logFile, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("Starting DreamPOS application")

	config, err := config.LoadConfig()
	if err != nil {
		slog.Error("Failed to read config", "error", err)
		os.Exit(1)
	}

	app := app.New(*config)
	app.Start()
}
