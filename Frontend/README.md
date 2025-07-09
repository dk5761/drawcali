# Excalidraw Frontend

A modern React frontend for the Excalidraw drawing application with user authentication and drawing management.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query** - Server state management with query factory pattern
- **Zustand** - Client state management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Excalidraw** - Drawing canvas
- **React Hook Form + Zod** - Form handling and validation

## Features

- 🔐 **User Authentication** - Register and login with JWT tokens
- 📝 **Drawing Management** - Create, save, edit, and delete drawings
- 🎨 **Excalidraw Integration** - Full-featured drawing canvas
- 💾 **Auto-save** - Automatic saving of changes
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Modern UI** - Clean interface with shadcn/ui components
- 🔄 **Real-time Updates** - Optimistic updates with TanStack Query
- 📤 **Export** - Download drawings as PNG files

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Backend server running on `http://localhost:8080`

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start the development server:**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`

## Usage

### Authentication

1. **Register**: Create a new account with email and password
2. **Login**: Sign in to access your drawings

### Drawing Management

1. **Create Drawing**: Click "New Drawing" to start creating
2. **Edit Drawing**: Click "Edit" on any drawing card
3. **Delete Drawing**: Click "Delete" with confirmation
4. **Auto-save**: Changes are automatically saved every 5 seconds
5. **Manual Save**: Use the "Save" button in the editor
6. **Export**: Download drawings as PNG files

### Drawing Editor

- Full Excalidraw functionality
- Real-time drawing with shapes, text, arrows
- Multiple selection and grouping
- Undo/redo operations
- Zoom and pan
- Background color selection

## API Integration

The frontend integrates with the Go backend API:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/drawings` - Get all user drawings
- `POST /api/v1/drawings` - Create new drawing
- `GET /api/v1/drawings/:id` - Get specific drawing
- `PUT /api/v1/drawings/:id` - Update drawing
- `DELETE /api/v1/drawings/:id` - Delete drawing

## Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── drawings/            # Drawing management
│   │   ├── DrawingList.tsx
│   │   └── DrawingEditor.tsx
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
├── lib/
│   ├── api.ts              # API client and types
│   ├── queryFactory.ts     # TanStack Query setup
│   └── utils.ts            # Utility functions
├── stores/
│   └── authStore.ts        # Zustand auth store
├── App.tsx                 # Main app with routing
├── main.tsx               # App entry point
└── index.css              # Tailwind CSS styles
```

## Development

### Building for Production

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

### Preview Production Build

```bash
pnpm preview
```

## Environment Variables

The app expects the backend to be running on `http://localhost:8080`. If your backend runs on a different port, update the proxy configuration in `vite.config.ts`.

## Key Features Explained

### Query Factory Pattern

The app uses a query factory pattern with TanStack Query for consistent API management:

```typescript
// lib/queryFactory.ts
export const queries = {
  drawings: {
    all: () => ({ queryKey: ["drawings"], queryFn: () => drawingApi.getAll() }),
    byId: (id: string) => ({
      queryKey: ["drawings", id],
      queryFn: () => drawingApi.getById(id),
    }),
  },
};
```

### State Management

- **Zustand** for authentication state
- **TanStack Query** for server state
- **React state** for component-level state

### Auto-save Functionality

Drawings are automatically saved 5 seconds after changes, with visual feedback for unsaved changes.

### Responsive Design

Built mobile-first with Tailwind CSS, ensuring great UX across all devices.
