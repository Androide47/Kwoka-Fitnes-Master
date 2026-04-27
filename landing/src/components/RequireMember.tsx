import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authApi } from "@/lib/api/authApi";

export default function RequireMember({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!authApi.requireRole("member")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
