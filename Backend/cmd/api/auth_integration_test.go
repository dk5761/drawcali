package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// registerAndLoginHelper registers a user and logs them in, returning the JWT token.
func registerAndLoginHelper(t *testing.T, router *gin.Engine, email, password string) string {
	// 1. Register user
	regPayload := `{"email": "` + email + `", "password": "` + password + `"}`
	regReq, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(regPayload))
	regReq.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, regReq)

	assert.Equal(t, http.StatusCreated, w.Code, "Failed to register user")

	// 2. Login user
	loginPayload := `{"email": "` + email + `", "password": "` + password + `"}`
	loginReq, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(loginPayload))
	loginReq.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, loginReq)

	assert.Equal(t, http.StatusOK, w.Code, "Failed to login user")

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	token, ok := response["token"]
	assert.True(t, ok, "Token not found in login response")
	assert.NotEmpty(t, token, "Token is empty")

	return token
}

func TestAuthIntegration(t *testing.T) {
	// The router is already set up by TestMain

	t.Run("Register and Login E2E", func(t *testing.T) {
		token := registerAndLoginHelper(t, testRouter, "e2e@example.com", "password123")
		assert.NotEmpty(t, token)
	})

	t.Run("Login with Invalid Credentials", func(t *testing.T) {
		// First, register a user to ensure it exists
		registerAndLoginHelper(t, testRouter, "invalidlogin@example.com", "password123")

		loginPayload := `{"email": "invalidlogin@example.com", "password": "wrongpassword"}`
		loginReq, _ := http.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBufferString(loginPayload))
		loginReq.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		testRouter.ServeHTTP(w, loginReq)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestDrawingIntegration(t *testing.T) {
	// The router is already set up by TestMain

	// Register and Login to get a token for protected routes
	token := registerAndLoginHelper(t, testRouter, "drawinguser@example.com", "password123")

	t.Run("Create Drawing - Success", func(t *testing.T) {
		drawingPayload := `{"title": "My Test Drawing", "sceneData": "{}"}`
		req, _ := http.NewRequest(http.MethodPost, "/api/v1/drawings", bytes.NewBufferString(drawingPayload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		testRouter.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
	})

	t.Run("Create Drawing - No Auth", func(t *testing.T) {
		drawingPayload := `{"title": "My Test Drawing", "sceneData": "{}"}`
		req, _ := http.NewRequest(http.MethodPost, "/api/v1/drawings", bytes.NewBufferString(drawingPayload))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		testRouter.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}