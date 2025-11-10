package main

import (
	"dreampos/internal/config"
	"fmt"
)


func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		return
	}

	_, _ = fmt.Println(cfg.Url)
}
