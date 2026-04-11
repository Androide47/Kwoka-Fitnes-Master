import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMemberSession } from "@/lib/auth";

export default function RequireMember({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!getMemberSession()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
