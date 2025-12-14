package main

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"
	"time"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"

	"dreampos/internal/app"
	"dreampos/internal/config"
)

type consoleHandler struct {
	handler slog.Handler
}

func (h *consoleHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.handler.Enabled(ctx, level)
}

func (h *consoleHandler) Handle(ctx context.Context, r slog.Record) error {
	timeStr := r.Time.Format("2006-01-02 15:04:05")
	level := r.Level.String()

	var output string

	var method, uri, status string
	r.Attrs(func(a slog.Attr) bool {
		switch a.Key {
		case "method":
			method = a.Value.String()
		case "uri":
			uri = a.Value.String()
		case "status":
			status = fmt.Sprintf("%v", a.Value.Any())
		}
		return true
	})

	if method != "" && uri != "" && status != "" {
		output = fmt.Sprintf("%s %s %s %s %s\n", timeStr, level, method, uri, status)
	} else {
		output = fmt.Sprintf("%s %s %s\n", timeStr, level, r.Message)
	}

	fmt.Print(output)
	return nil
}

func (h *consoleHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &consoleHandler{handler: h.handler.WithAttrs(attrs)}
}

func (h *consoleHandler) WithGroup(name string) slog.Handler {
	return &consoleHandler{handler: h.handler.WithGroup(name)}
}

type multiHandler struct {
	handlers []slog.Handler
}

func (h *multiHandler) Enabled(ctx context.Context, level slog.Level) bool {
	for _, handler := range h.handlers {
		if handler.Enabled(ctx, level) {
			return true
		}
	}
	return false
}

func (h *multiHandler) Handle(ctx context.Context, r slog.Record) error {
	for _, handler := range h.handlers {
		if err := handler.Handle(ctx, r.Clone()); err != nil {
			return err
		}
	}
	return nil
}

func (h *multiHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	handlers := make([]slog.Handler, len(h.handlers))
	for i, handler := range h.handlers {
		handlers[i] = handler.WithAttrs(attrs)
	}
	return &multiHandler{handlers: handlers}
}

func (h *multiHandler) WithGroup(name string) slog.Handler {
	handlers := make([]slog.Handler, len(h.handlers))
	for i, handler := range h.handlers {
		handlers[i] = handler.WithGroup(name)
	}
	return &multiHandler{handlers: handlers}
}

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

	// JSON logs to file
	fileLogger := slog.NewJSONHandler(logFile, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})

	// Pretty console logs
	consoleLogger := &consoleHandler{
		handler: slog.NewTextHandler(io.Discard, nil),
	}

	// Use custom multi-handler to write both in file and console
	logger := slog.New(&multiHandler{
		handlers: []slog.Handler{fileLogger, consoleLogger},
	})
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
