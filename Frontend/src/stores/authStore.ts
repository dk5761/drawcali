import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "../lib/queryFactory";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,

      login: (token: string) => {
        localStorage.setItem("auth-token", token);
        set({ isAuthenticated: true, token });
      },

      logout: () => {
        localStorage.removeItem("auth-token");
        queryClient.clear(); // Clear all cached queries on logout
        set({ isAuthenticated: false, token: null });
      },

      checkAuth: () => {
        const token = localStorage.getItem("auth-token");
        if (token) {
          set({ isAuthenticated: true, token });
        } else {
          set({ isAuthenticated: false, token: null });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);
