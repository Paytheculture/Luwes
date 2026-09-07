package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

	"luwes-dekorasi-api/handlers"
	"luwes-dekorasi-api/middleware"
	"luwes-dekorasi-api/services"
)

func main() {
	godotenv.Load(".env")

	// Init services
	sheetsService, err := services.NewSheetsService()
	if err != nil {
		log.Fatalf("Gagal konek ke Google Sheets: %v", err)
	}

	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		log.Fatalf("Gagal konek ke Cloudinary: %v", err)
	}

	// Init handlers
	authHandler := handlers.NewAuthHandler(sheetsService)
	pesananHandler := handlers.NewPesananHandler(sheetsService)
	itemsHandler := handlers.NewItemsHandler(sheetsService)
	modelsHandler := handlers.NewModelsHandler(sheetsService)
	uploadHandler := handlers.NewUploadHandler(cloudinaryService)

	// Setup router
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	// Public routes
	r.POST("/api/login", authHandler.Login)

	// Utility: hash password (dev only)
	r.GET("/api/hash/:password", func(c *gin.Context) {
		pw := c.Param("password")
		hash, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		c.JSON(200, gin.H{"hash": string(hash)})
	})

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/me", authHandler.Me)

		// Pesanan
		api.GET("/pesanan", pesananHandler.GetAll)
		api.POST("/pesanan", pesananHandler.Create)
		api.GET("/pesanan/:id", pesananHandler.GetByID)
		api.PUT("/pesanan/:id", pesananHandler.Update)
		api.DELETE("/pesanan/:id", pesananHandler.Delete)

		// Items
		api.GET("/items", itemsHandler.GetAll)
		api.POST("/items", itemsHandler.Create)
		api.PUT("/items/:id", itemsHandler.Update)
		api.DELETE("/items/:id", itemsHandler.Delete)

		// Upload
		api.GET("/models", modelsHandler.GetAll)
		api.POST("/models", modelsHandler.Create)
		api.PUT("/models/:id", modelsHandler.Update)
		api.DELETE("/models/:id", modelsHandler.Delete)

		api.POST("/upload", uploadHandler.Upload)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on port %s\n", port)
	r.Run(":" + port)
}
