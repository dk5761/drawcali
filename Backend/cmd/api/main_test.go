package main

import (
	"context"
	"log"
	"os"
	"testing"

	"github.com/drshn/excalidraw/Backend/internal/config"
	"github.com/drshn/excalidraw/Backend/internal/database"
	"github.com/drshn/excalidraw/Backend/internal/handlers"
	"github.com/drshn/excalidraw/Backend/internal/middleware"
	"github.com/drshn/excalidraw/Backend/internal/repository"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

var testRouter *gin.Engine
var testDB *mongo.Database

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)

	cfg := config.LoadConfig()
	cfg.DBName = cfg.DBName + "_test"

	dbClient, err := database.GetMongoClient(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to test MongoDB: %v", err)
	}
	testDB = dbClient.Database(cfg.DBName)

	testRouter = setupRouter(cfg, testDB)

	code := m.Run()

	if err := testDB.Drop(context.Background()); err != nil {
		log.Fatalf("Failed to drop test database: %v", err)
	}

	os.Exit(code)
}

func setupRouter(cfg *config.Config, db *mongo.Database) *gin.Engine {
	r := gin.Default()

	// Repositories
	userRepo := repository.NewMongoUserRepository(db)
	drawingRepo := repository.NewMongoDrawingRepository(db)

	// Handlers
	authHandler := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)
	drawingHandler := handlers.NewDrawingHandler(drawingRepo)

	// Routes
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		drawings := api.Group("/drawings")
		drawings.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			drawings.POST("", drawingHandler.CreateDrawing)
			drawings.GET("", drawingHandler.GetDrawings)
			drawings.GET("/:id", drawingHandler.GetDrawingByID)
			drawings.PUT("/:id", drawingHandler.UpdateDrawing)
			drawings.DELETE("/:id", drawingHandler.DeleteDrawing)
		}
	}

	return r
}
