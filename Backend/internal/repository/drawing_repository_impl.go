package repository

import (
	"context"

	"github.com/drshn/excalidraw/Backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type mongoDrawingRepository struct {
	collection *mongo.Collection
}

func NewMongoDrawingRepository(db *mongo.Database) DrawingRepository {
	return &mongoDrawingRepository{
		collection: db.Collection("drawings"),
	}
}

func (r *mongoDrawingRepository) Create(ctx context.Context, drawing *models.Drawing) error {
	_, err := r.collection.InsertOne(ctx, drawing)
	return err
}

func (r *mongoDrawingRepository) FindAllByUserID(ctx context.Context, userID primitive.ObjectID) ([]*models.Drawing, error) {
	// Projection to exclude the large sceneData field
	opts := options.Find().SetProjection(bson.M{"sceneData": 0})
	cursor, err := r.collection.Find(ctx, bson.M{"userId": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var drawings []*models.Drawing
	if err = cursor.All(ctx, &drawings); err != nil {
		return nil, err
	}
	return drawings, nil
}

func (r *mongoDrawingRepository) FindByIDAndUserID(ctx context.Context, id, userID primitive.ObjectID) (*models.Drawing, error) {
	var drawing models.Drawing
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "userId": userID}).Decode(&drawing)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &drawing, nil
}

func (r *mongoDrawingRepository) Update(ctx context.Context, drawing *models.Drawing) error {
	filter := bson.M{"_id": drawing.ID, "userId": drawing.UserID}
	update := bson.M{"$set": bson.M{"title": drawing.Title, "sceneData": drawing.SceneData}}

	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments // Or a custom not found error
	}
	return nil
}

func (r *mongoDrawingRepository) Delete(ctx context.Context, id, userID primitive.ObjectID) error {
	filter := bson.M{"_id": id, "userId": userID}
	result, err := r.collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments // Or a custom not found error
	}
	return nil
}
