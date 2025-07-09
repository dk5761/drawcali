package database

import (
	"context"
	"log"
	"sync"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/drshn/excalidraw/Backend/internal/config"
)

var (
	clientInstance *mongo.Client
	once             sync.Once
)

func GetMongoClient(cfg *config.Config) (*mongo.Client, error) {
	var err error
	once.Do(func() {
		serverAPI := options.ServerAPI(options.ServerAPIVersion1)
		opts := options.Client().ApplyURI(cfg.MongoDBURI).SetServerAPIOptions(serverAPI)

		client, innerErr := mongo.Connect(context.TODO(), opts)
		if innerErr != nil {
			err = innerErr
			return
		}

		if err := client.Ping(context.TODO(), nil); err != nil {
			log.Fatalf("Failed to ping MongoDB: %v", err)
		}

		clientInstance = client
		log.Println("Successfully connected to MongoDB!")
	})
	return clientInstance, err
}
