import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface Drawing {
  _id?: string;
  userId?: string;
  title: string;
  sceneData: string;
}

export interface CreateDrawingRequest {
  title: string;
  sceneData: string;
}

export interface UpdateDrawingRequest {
  title: string;
  sceneData: string;
}

// API functions
export const authApi = {
  login: async (credentials: User): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (credentials: User): Promise<RegisterResponse> => {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  },
};

export const drawingApi = {
  create: async (drawing: CreateDrawingRequest): Promise<Drawing> => {
    const response = await api.post("/drawings", drawing);
    return response.data;
  },

  getAll: async (): Promise<Drawing[]> => {
    const response = await api.get("/drawings");
    return response.data || [];
  },

  getById: async (id: string): Promise<Drawing> => {
    const response = await api.get(`/drawings/${id}`);
    return response.data;
  },

  update: async (id: string, drawing: UpdateDrawingRequest): Promise<void> => {
    await api.put(`/drawings/${id}`, drawing);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/drawings/${id}`);
  },
};

export default api;
