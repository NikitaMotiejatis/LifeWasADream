package config

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	Url    string
}

func LoadConfig() (*Config, error) {
	ca := &Config{}

	ca.Url = os.Getenv("URL")

	return ca, nil
}
