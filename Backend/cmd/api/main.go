package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/drshn/excalidraw/Backend/internal/config"
	"github.com/drshn/excalidraw/Backend/internal/database"
	"github.com/drshn/excalidraw/Backend/internal/handlers"
	"github.com/drshn/excalidraw/Backend/internal/middleware"
	"github.com/drshn/excalidraw/Backend/internal/repository"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	db, err := database.GetMongoClient(cfg)
	if err != nil {
		log.Fatalf("Could not connect to MongoDB: %v", err)
	}

	userRepo := repository.NewMongoUserRepository(db.Database(cfg.DBName))
	drawingRepo := repository.NewMongoDrawingRepository(db.Database(cfg.DBName))

	authHandler := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)
	drawingHandler := handlers.NewDrawingHandler(drawingRepo)

	r := gin.Default()

	// Configure CORS to allow all origins
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

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

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	log.Printf("Server starting on port %s", cfg.Port)

	// Wait for interrupt signal to gracefully shut down the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL (cannot be caught or handled)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")

	// Disconnect from MongoDB
	if err := db.Disconnect(context.Background()); err != nil {
		log.Fatalf("Failed to disconnect from MongoDB: %v", err)
	}
	log.Println("Disconnected from MongoDB")
}
