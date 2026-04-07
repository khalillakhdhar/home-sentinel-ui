import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RedirectIfAuthenticated, RequireAuth } from "@/components/AuthGuards";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CameraPage from "./pages/CameraPage";
import GasPage from "./pages/GasPage";
import IntrusionsPage from "./pages/IntrusionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectIfAuthenticated>
                  <SignupPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/gas" element={<GasPage />} />
              <Route path="/intrusions" element={<IntrusionsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
