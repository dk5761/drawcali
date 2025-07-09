
package repository

import (
	"context"
	"errors"

	"github.com/drshn/excalidraw/Backend/internal/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MockUserRepository is a mock implementation of UserRepository for testing.
type MockUserRepository struct {
	Users         map[string]*models.User
	CreateFunc      func(ctx context.Context, user *models.User) error
	FindByEmailFunc func(ctx context.Context, email string) (*models.User, error)
	FindByIDFunc    func(ctx context.Context, id primitive.ObjectID) (*models.User, error)
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		Users: make(map[string]*models.User),
	}
}

func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, user)
	}
	if _, exists := m.Users[user.Email]; exists {
		return errors.New("user already exists")
	}
	m.Users[user.Email] = user
	return nil
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	if m.FindByEmailFunc != nil {
		return m.FindByEmailFunc(ctx, email)
	}
	user, exists := m.Users[email]
	if !exists {
		return nil, nil // Mimics mongo.ErrNoDocuments
	}
	return user, nil
}

func (m *MockUserRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.User, error) {
	if m.FindByIDFunc != nil {
		return m.FindByIDFunc(ctx, id)
	}
	for _, user := range m.Users {
		if user.ID == id {
			return user, nil
		}
	}
	return nil, nil
}
