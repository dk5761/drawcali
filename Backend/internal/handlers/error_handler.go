package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIError represents a standard error response format.
type APIError struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// HandleError provides a consistent way to handle errors across the API.
func HandleError(c *gin.Context, status int, message string, err error) {
	apiError := APIError{
		Status:  status,
		Message: message,
	}
	if err != nil {
		apiError.Error = err.Error()
	}
	c.JSON(status, apiError)
	c.Abort()
}

// Pre-defined error helpers
func BadRequest(c *gin.Context, err error) {
	HandleError(c, http.StatusBadRequest, "Invalid request payload", err)
}

func Unauthorized(c *gin.Context, message string) {
	HandleError(c, http.StatusUnauthorized, message, nil)
}

func NotFound(c *gin.Context, message string) {
	HandleError(c, http.StatusNotFound, message, nil)
}

func InternalServerError(c *gin.Context, err error) {
	HandleError(c, http.StatusInternalServerError, "An unexpected error occurred", err)
}

func Conflict(c *gin.Context, message string) {
	HandleError(c, http.StatusConflict, message, nil)
}
