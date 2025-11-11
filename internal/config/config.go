package config

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	Url    string

	DbHostname	string
	DbPort		string
	DbName		string
	DbUser		string
	DbPass		string
}

func LoadConfig() (*Config, error) {
	ca := &Config{}

	ca.Url = os.Getenv("URL")

	ca.DbHostname 	= os.Getenv("DB_HOSTNAME")
	ca.DbPort	 	= os.Getenv("DB_PORT")
	ca.DbName	 	= os.Getenv("DB_NAME")
	ca.DbUser	 	= os.Getenv("DB_USER")
	ca.DbPass	 	= os.Getenv("DB_PASS")

	return ca, nil
}
