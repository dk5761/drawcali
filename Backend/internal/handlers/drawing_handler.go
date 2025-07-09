package handlers

import (
	"net/http"

	"github.com/drshn/excalidraw/Backend/internal/models"
	"github.com/drshn/excalidraw/Backend/internal/repository"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DrawingHandler struct {
	DrawingRepo repository.DrawingRepository
}

func NewDrawingHandler(drawingRepo repository.DrawingRepository) *DrawingHandler {
	return &DrawingHandler{DrawingRepo: drawingRepo}
}

type CreateDrawingRequest struct {
	Title     string `json:"title" binding:"required"`
	SceneData string `json:"sceneData" binding:"required"`
}

func (h *DrawingHandler) CreateDrawing(c *gin.Context) {
	var req CreateDrawingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err)
		return
	}

	userID, err := getUserIDFromContext(c)
	if err != nil {
		InternalServerError(c, err)
		return
	}

	drawing := &models.Drawing{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Title:     req.Title,
		SceneData: req.SceneData,
	}

	if err := h.DrawingRepo.Create(c.Request.Context(), drawing); err != nil {
		InternalServerError(c, err)
		return
	}

	c.JSON(http.StatusCreated, drawing)
}

func (h *DrawingHandler) GetDrawings(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		InternalServerError(c, err)
		return
	}

	drawings, err := h.DrawingRepo.FindAllByUserID(c.Request.Context(), userID)
	if err != nil {
		InternalServerError(c, err)
		return
	}

	c.JSON(http.StatusOK, drawings)
}

func (h *DrawingHandler) GetDrawingByID(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		InternalServerError(c, err)
		return
	}

	drawingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		BadRequest(c, err)
		return
	}

	drawing, err := h.DrawingRepo.FindByIDAndUserID(c.Request.Context(), drawingID, userID)
	if err != nil {
		InternalServerError(c, err)
		return
	}
	if drawing == nil {
		NotFound(c, "Drawing not found")
		return
	}

	c.JSON(http.StatusOK, drawing)
}

type UpdateDrawingRequest struct {
	Title     string `json:"title"`
	SceneData string `json:"sceneData"`
}

func (h *DrawingHandler) UpdateDrawing(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		InternalServerError(c, err)
		return
	}

	drawingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		BadRequest(c, err)
		return
	}

	var req UpdateDrawingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err)
		return
	}

	drawing := &models.Drawing{
		ID:        drawingID,
		UserID:    userID,
		Title:     req.Title,
		SceneData: req.SceneData,
	}

	if err := h.DrawingRepo.Update(c.Request.Context(), drawing); err != nil {
		InternalServerError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Drawing updated successfully"})
}

func (h *DrawingHandler) DeleteDrawing(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		InternalServerError(c, err)
		return
	}

	drawingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		BadRequest(c, err)
		return
	}

	if err := h.DrawingRepo.Delete(c.Request.Context(), drawingID, userID); err != nil {
		InternalServerError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Drawing deleted successfully"})
}

// getUserIDFromContext is a helper to reduce repetition
func getUserIDFromContext(c *gin.Context) (primitive.ObjectID, error) {
	userIDHex, exists := c.Get("userID")
	if !exists {
		return primitive.NilObjectID, http.ErrAbortHandler // Should not happen if middleware is correct
	}
	return primitive.ObjectIDFromHex(userIDHex.(string))
}
