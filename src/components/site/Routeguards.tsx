import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router"
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!session) return <Link to="/login" replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!session) return <Link to="/login" replace />;
  if (!isAdmin) return <Link to="/dashboard" replace />;
  return <>{children}</>;
}

function FullPageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F5EDE0" }}
    >
      <div
        className="h-8 w-8 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: "#6B1E23", borderTopColor: "transparent" }}
      />
    </div>
  );
}