import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Chargement de la session...</p>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
