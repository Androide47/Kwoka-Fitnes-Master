import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authApi } from "@/lib/api/authApi";
import { memberProfileApi } from "@/lib/api/memberProfileApi";

/** Sends members who have not finished onboarding to `/onboarding`. */
export default function RequireOnboarding({ children }: { children: ReactNode }) {
  const location = useLocation();
  const session = authApi.getMemberSession();
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!memberProfileApi.isCompleteFor(session.user.id)) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
