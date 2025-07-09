package repository

import (
	"context"

	"github.com/drshn/excalidraw/Backend/internal/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DrawingRepository interface {
	Create(ctx context.Context, drawing *models.Drawing) error
	FindAllByUserID(ctx context.Context, userID primitive.ObjectID) ([]*models.Drawing, error)
	FindByIDAndUserID(ctx context.Context, id, userID primitive.ObjectID) (*models.Drawing, error)
	Update(ctx context.Context, drawing *models.Drawing) error
	Delete(ctx context.Context, id, userID primitive.ObjectID) error
}
