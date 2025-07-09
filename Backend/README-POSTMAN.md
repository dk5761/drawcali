# Excalidraw Backend API - Postman Configuration

This directory contains Postman collection and environment files for testing the Excalidraw backend API.

## Files

- `Excalidraw-Backend.postman_collection.json` - Complete API collection with all endpoints
- `Excalidraw-Backend.postman_environment.json` - Environment variables for easy testing

## Setup Instructions

### 1. Start the Backend Server

First, make sure your backend server is running:

```bash
# Using Docker Compose (recommended)
docker-compose up

# OR using Go directly
go run cmd/api/main.go
```

The server will start on `http://localhost:8080` by default.

### 2. Import into Postman

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Excalidraw-Backend.postman_collection.json`
   - `Excalidraw-Backend.postman_environment.json`
4. Click **Import**

### 3. Select Environment

1. In Postman, click the environment dropdown (top right)
2. Select **"Excalidraw Backend Environment"**

## API Endpoints

### Authentication (No Auth Required)

#### Register User

- **POST** `/api/v1/auth/register`
- **Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "testpassword123"
  }
  ```
- **Response**: User ID
- **Auto-sets**: `userId` environment variable

#### Login User

- **POST** `/api/v1/auth/login`
- **Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "testpassword123"
  }
  ```
- **Response**: JWT token
- **Auto-sets**: `authToken` environment variable

### Drawings (Authentication Required)

All drawing endpoints require JWT authentication. The token is automatically added to requests after login.

#### Create Drawing

- **POST** `/api/v1/drawings`
- **Auth**: Bearer token (automatically added)
- **Body**:
  ```json
  {
    "title": "My First Drawing",
    "sceneData": "{\"type\":\"excalidraw\",\"version\":2,\"elements\":[],\"appState\":{\"gridSize\":null,\"viewBackgroundColor\":\"#ffffff\"}}"
  }
  ```
- **Auto-sets**: `drawingId` environment variable

#### Get All Drawings

- **GET** `/api/v1/drawings`
- **Auth**: Bearer token (automatically added)
- **Response**: Array of user's drawings

#### Get Drawing by ID

- **GET** `/api/v1/drawings/{id}`
- **Auth**: Bearer token (automatically added)
- **Response**: Single drawing object

#### Update Drawing

- **PUT** `/api/v1/drawings/{id}`
- **Auth**: Bearer token (automatically added)
- **Body**:
  ```json
  {
    "title": "My Updated Drawing",
    "sceneData": "{\"type\":\"excalidraw\",\"version\":2,\"elements\":[{\"type\":\"rectangle\",\"x\":100,\"y\":100,\"width\":200,\"height\":100}],\"appState\":{\"gridSize\":null,\"viewBackgroundColor\":\"#ffffff\"}}"
  }
  ```

#### Delete Drawing

- **DELETE** `/api/v1/drawings/{id}`
- **Auth**: Bearer token (automatically added)

## Testing Workflow

### Quick Start Testing

1. **Register a new user**

   - Run "Register User" request
   - This automatically saves the `userId`

2. **Login**

   - Run "Login User" request
   - This automatically saves the JWT `authToken`

3. **Create a drawing**

   - Run "Create Drawing" request
   - This automatically saves the `drawingId`

4. **Test other endpoints**
   - All drawing endpoints will now work with the saved `authToken` and `drawingId`

### Environment Variables

The environment includes these pre-configured variables:

| Variable                  | Default Value           | Description                       |
| ------------------------- | ----------------------- | --------------------------------- |
| `baseUrl`                 | `http://localhost:8080` | API base URL                      |
| `userEmail`               | `test@example.com`      | Test user email                   |
| `userPassword`            | `testpassword123`       | Test user password                |
| `authToken`               | _(auto-set)_            | JWT token from login              |
| `userId`                  | _(auto-set)_            | User ID from registration         |
| `drawingId`               | _(auto-set)_            | Drawing ID from creation          |
| `drawingTitle`            | `My First Drawing`      | Default drawing title             |
| `drawingSceneData`        | _(JSON)_                | Sample Excalidraw scene data      |
| `updatedDrawingTitle`     | `My Updated Drawing`    | Updated drawing title             |
| `updatedDrawingSceneData` | _(JSON)_                | Updated scene data with rectangle |

### Customization

You can modify the environment variables to test with different data:

1. Click the eye icon next to the environment dropdown
2. Click **Edit** on "Excalidraw Backend Environment"
3. Modify values as needed
4. Save changes

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created (for registration/creation)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

## Authentication Notes

- JWT tokens expire after 7 days
- The `authToken` is automatically included in all drawing endpoints
- If you get `401` errors, re-run the "Login User" request to refresh the token
- All drawing operations are user-scoped (users can only access their own drawings)

## Database Requirements

The backend requires MongoDB to be running. The Docker Compose setup handles this automatically:

- MongoDB runs on `localhost:27017`
- Database name: `excalidraw`
- Collections: `users`, `drawings`

## Troubleshooting

### Server Not Starting

- Check if port 8080 is available
- Ensure MongoDB is running
- Check Docker/Go installation

### Authentication Issues

- Verify the JWT token is set in environment variables
- Check token expiration (7 days)
- Ensure you've completed the login flow

### Database Issues

- Verify MongoDB is running on port 27017
- Check Docker Compose logs: `docker-compose logs`
- Restart services: `docker-compose down && docker-compose up`
