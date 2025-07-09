package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/drshn/excalidraw/Backend/internal/models"
	"github.com/drshn/excalidraw/Backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAuthHandler_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Successful Registration", func(t *testing.T) {
		mockUserRepo := repository.NewMockUserRepository()
		authHandler := NewAuthHandler(mockUserRepo, "test-secret")

		r := gin.Default()
		r.POST("/register", authHandler.Register)

		payload := `{"email": "test@example.com", "password": "password123"}`
		req, _ := http.NewRequest(http.MethodPost, "/register", bytes.NewBufferString(payload))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Contains(t, response, "userId")
	})

	t.Run("Email Already Exists", func(t *testing.T) {
		mockUserRepo := repository.NewMockUserRepository()
		// Pre-populate the mock repo
		mockUserRepo.Create(nil, &models.User{Email: "test@example.com"})
		authHandler := NewAuthHandler(mockUserRepo, "test-secret")

		r := gin.Default()
		r.POST("/register", authHandler.Register)

		payload := `{"email": "test@example.com", "password": "password123"}`
		req, _ := http.NewRequest(http.MethodPost, "/register", bytes.NewBufferString(payload))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusConflict, w.Code)
	})
}

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Setup: Create a user to log in with
	mockUserRepo := repository.NewMockUserRepository()
	// Note: In a real scenario, you'd hash the password properly before storing.
	// For this test, we'll handle the logic inside the handler.
	authHandler := NewAuthHandler(mockUserRepo, "test-secret")
	// Manually register a user to test login
	regPayload := `{"email": "login@example.com", "password": "password123"}`
	regReq, _ := http.NewRequest(http.MethodPost, "/register", bytes.NewBufferString(regPayload))
	regReq.Header.Set("Content-Type", "application/json")
	regW := httptest.NewRecorder()
	router := gin.Default()
	router.POST("/register", authHandler.Register)
	router.ServeHTTP(regW, regReq)
	assert.Equal(t, http.StatusCreated, regW.Code)

	t.Run("Successful Login", func(t *testing.T) {
		router.POST("/login", authHandler.Login)

		loginPayload := `{"email": "login@example.com", "password": "password123"}`
		loginReq, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBufferString(loginPayload))
		loginReq.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, loginReq)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Contains(t, response, "token")
	})

	t.Run("Invalid Credentials", func(t *testing.T) {
		router.POST("/login", authHandler.Login)

		loginPayload := `{"email": "login@example.com", "password": "wrongpassword"}`
		loginReq, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBufferString(loginPayload))
		loginReq.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, loginReq)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
