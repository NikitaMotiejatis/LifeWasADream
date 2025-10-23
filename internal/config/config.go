package config

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	Url    string
	DdPath string
}

func LoadConfig() (*Config, error) {
	ca := &Config{}

	ca.Url = os.Getenv("URL")
	ca.DdPath = os.Getenv("DB_PATH")

	return ca, nil
}
