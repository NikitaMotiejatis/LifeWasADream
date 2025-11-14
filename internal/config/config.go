package config

import "os"

type Config struct {
	Url    string

	DbHostname	string
	DbPort		string
	DbName		string
	DbUser		string
	DbPass		string
}

func LoadConfig() (*Config, error) {
	config := &Config{
		Url: os.Getenv("URL"),

		DbHostname: os.Getenv("DB_HOSTNAME"),
		DbPort:	 	os.Getenv("DB_PORT"),
		DbName:	 	os.Getenv("DB_NAME"),
		DbUser:	 	os.Getenv("DB_USER"),
		DbPass:	 	os.Getenv("DB_PASS"),
	}

	return config, nil
}
