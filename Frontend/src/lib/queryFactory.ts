import { QueryClient } from "@tanstack/react-query";
import {
  authApi,
  drawingApi,
  type User,
  type UpdateDrawingRequest,
} from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Query Keys
export const queryKeys = {
  auth: ["auth"] as const,
  drawings: ["drawings"] as const,
  drawing: (id: string) => ["drawings", id] as const,
};

// Query Factory
export const queries = {
  // Auth queries
  auth: {
    login: (credentials: User) => ({
      queryKey: [...queryKeys.auth, "login"],
      queryFn: () => authApi.login(credentials),
      enabled: false, // Manual trigger
    }),

    register: (credentials: User) => ({
      queryKey: [...queryKeys.auth, "register"],
      queryFn: () => authApi.register(credentials),
      enabled: false, // Manual trigger
    }),
  },

  // Drawing queries
  drawings: {
    all: () => ({
      queryKey: queryKeys.drawings,
      queryFn: () => drawingApi.getAll(),
    }),

    byId: (id: string) => ({
      queryKey: queryKeys.drawing(id),
      queryFn: () => drawingApi.getById(id),
      enabled: !!id,
    }),
  },
};

// Mutations
export const mutations = {
  // Auth mutations
  auth: {
    login: () => ({
      mutationFn: authApi.login,
      onSuccess: (data: any) => {
        localStorage.setItem("auth-token", data.token);
      },
    }),

    register: () => ({
      mutationFn: authApi.register,
    }),
  },

  // Drawing mutations
  drawings: {
    create: () => ({
      mutationFn: drawingApi.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.drawings });
      },
    }),

    update: () => ({
      mutationFn: ({ id, ...data }: { id: string } & UpdateDrawingRequest) =>
        drawingApi.update(id, data),
      onSuccess: (_: any, variables: { id: string }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.drawings });
        queryClient.invalidateQueries({
          queryKey: queryKeys.drawing(variables.id),
        });
      },
    }),

    delete: () => ({
      mutationFn: drawingApi.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.drawings });
      },
    }),
  },
};
