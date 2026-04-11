import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getTrainerSession } from "@/lib/auth";

export default function RequireTrainer({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!getTrainerSession()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
