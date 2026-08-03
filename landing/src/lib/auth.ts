export {
  clearMemberSession,
  clearTrainerSession,
  getCurrentSession,
  getMemberSession,
  getTrainerSession,
  login,
  registerMember,
  setMemberSession,
  setTrainerSession,
} from "@/lib/api/authApi";

import { authApi } from "@/lib/api/authApi";
import { memberProfileApi } from "@/lib/api/memberProfileApi";

/** Destination for "Go to panel" based on the active demo session. */
export function getPanelPath(): string | null {
  const trainer = authApi.getTrainerSession();
  if (trainer) return "/trainer";

  const member = authApi.getMemberSession();
  if (!member) return null;
  if (!memberProfileApi.isCompleteFor(member.user.id)) return "/onboarding";
  return "/dashboard";
}

export function isSignedIn(): boolean {
  return authApi.getCurrentSession() != null;
}
