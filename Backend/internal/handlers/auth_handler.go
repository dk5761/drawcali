package handlers

import (
	"net/http"
	"time"

	"github.com/drshn/excalidraw/Backend/internal/models"
	"github.com/drshn/excalidraw/Backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	UserRepo  repository.UserRepository
	JWTSecret string
}

func NewAuthHandler(userRepo repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		UserRepo:  userRepo,
		JWTSecret: jwtSecret,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err)
		return
	}

	existingUser, err := h.UserRepo.FindByEmail(c.Request.Context(), req.Email)
	if err != nil {
		InternalServerError(c, err)
		return
	}
	if existingUser != nil {
		Conflict(c, "User with this email already exists")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		InternalServerError(c, err)
		return
	}

	user := &models.User{
		ID:       primitive.NewObjectID(),
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	if err := h.UserRepo.Create(c.Request.Context(), user); err != nil {
		InternalServerError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "userId": user.ID.Hex()})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err)
		return
	}

	user, err := h.UserRepo.FindByEmail(c.Request.Context(), req.Email)
	if err != nil {
		InternalServerError(c, err)
		return
	}
	if user == nil {
		Unauthorized(c, "Invalid email or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		Unauthorized(c, "Invalid email or password")
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID.Hex(),
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // 1 week
	})

	tokenString, err := token.SignedString([]byte(h.JWTSecret))
	if err != nil {
		InternalServerError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
