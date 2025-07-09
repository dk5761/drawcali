package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	Port       string `mapstructure:"PORT"`
	MongoDBURI string `mapstructure:"MONGODB_URI"`
	DBName     string `mapstructure:"DB_NAME"`
	JWTSecret  string `mapstructure:"JWT_SECRET"`
}

func LoadConfig() *Config {
	v := viper.New()

	// Set default values
	v.SetDefault("PORT", "8080")
	v.SetDefault("MONGODB_URI", "mongodb://localhost:27017")
	v.SetDefault("DB_NAME", "excalidraw")
	v.SetDefault("JWT_SECRET", "a-very-secret-key")

	// Read from environment variables
	v.AutomaticEnv()

	// Optionally, read from a .env file (if godotenv is still desired)
	// v.SetConfigFile(".env")
	// if err := v.ReadInConfig(); err != nil {
	// 	if _, ok := err.(viper.ConfigFileNotFoundError); ok {
	// 		log.Println("No .env file found, using environment variables or defaults.")
	// 	} else {
	// 		log.Fatalf("Error reading config file: %v", err)
	// 	}
	// }

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		log.Fatalf("Unable to decode into struct, %v", err)
	}

	return &cfg
}