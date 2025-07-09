import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryFactory";
import { ThemeProvider } from "./components/theme-provider";
import { AuthGuard } from "./components/auth/AuthGuard";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { DrawingList } from "./components/drawings/DrawingList";
import { DrawingEditor } from "./components/drawings/DrawingEditor";
import { ColorPaletteDemo } from "./components/ColorPaletteDemo";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="excalidraw-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/colors" element={<ColorPaletteDemo />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <DrawingList />
                </AuthGuard>
              }
            />
            <Route
              path="/drawing/:id"
              element={
                <AuthGuard>
                  <DrawingEditor />
                </AuthGuard>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
