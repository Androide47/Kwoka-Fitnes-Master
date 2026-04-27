import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getTrainerSession } from "@/lib/api/authApi";

export default function RequireTrainer({ children }: { children: ReactNode }) {
  const location = useLocation();
  const session = getTrainerSession();
  if (!session || session.user.role !== "trainer") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
