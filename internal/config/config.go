package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Url    			string
	VitePort		uint16 // TODO: maybe rename to smth like FrontendPort

	JwtSecret		string

	XSRFHeaderKey	string
	XSRFCookieName	string

	DbHostname		string
	DbPort			string
	DbName			string
	DbUser			string
	DbPass			string
}

func LoadConfig() (*Config, error) {
	vitePort, err := strconv.ParseUint(os.Getenv("VITE_PORT"), 10, 16)
	if err != nil {
		return &Config{}, fmt.Errorf("failed to read VITE_PORT: %w", err)
	}

	config := &Config{
		Url: 			os.Getenv("URL"),
		VitePort: 		uint16(vitePort),

		XSRFHeaderKey: 	os.Getenv("XSRF_HEADER_KEY"),
		XSRFCookieName:	os.Getenv("XSRF_COOKIE_NAME"),

		DbHostname: 	os.Getenv("DB_HOSTNAME"),
		DbPort:	 		os.Getenv("DB_PORT"),
		DbName:	 		os.Getenv("DB_NAME"),
		DbUser:	 		os.Getenv("DB_USER"),
		DbPass:	 		os.Getenv("DB_PASS"),
	}

	return config, nil
}
