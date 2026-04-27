import { readJson, removeJson, writeJson } from "@/lib/api/storage";
import type { AuthSession, UserRole } from "@/lib/api/types";

const MEMBER_KEY = "kwoka_member_session";
const TRAINER_KEY = "kwoka_trainer_session";

function sessionFor(email: string, role: UserRole): AuthSession {
  const normalized = email.trim().toLowerCase();
  return {
    token: `demo-${role}-${normalized}`,
    user: {
      id: `${role}-${normalized}`,
      name: normalized.split("@")[0] || role,
      email: normalized,
      role,
    },
    issuedAt: Date.now(),
  };
}

export const authApi = {
  login(input: { email: string; password?: string; role: Exclude<UserRole, "admin"> }): AuthSession {
    if (!input.email.trim()) {
      throw new Error("Email is required.");
    }
    if (input.role === "trainer") {
      removeJson(MEMBER_KEY);
      const session = sessionFor(input.email, "trainer");
      writeJson(TRAINER_KEY, session);
      return session;
    }
    removeJson(TRAINER_KEY);
    const session = sessionFor(input.email, "client");
    writeJson(MEMBER_KEY, session);
    return session;
  },

  registerMember(input: { email: string; name?: string; password?: string }): AuthSession {
    if (!input.email.trim()) {
      throw new Error("Email is required.");
    }
    removeJson(TRAINER_KEY);
    const session = sessionFor(input.email, "client");
    if (input.name?.trim()) {
      session.user.name = input.name.trim();
    }
    writeJson(MEMBER_KEY, session);
    return session;
  },

  getMemberSession(): AuthSession | null {
    return readJson<AuthSession>(MEMBER_KEY, null);
  },

  getTrainerSession(): AuthSession | null {
    return readJson<AuthSession>(TRAINER_KEY, null);
  },

  clearMemberSession() {
    removeJson(MEMBER_KEY);
  },

  clearTrainerSession() {
    removeJson(TRAINER_KEY);
  },

  getCurrentSession(): AuthSession | null {
    return this.getTrainerSession() ?? this.getMemberSession();
  },

  logout() {
    this.clearMemberSession();
    this.clearTrainerSession();
  },

  requireRole(role: "member" | "client" | "trainer" | "admin") {
    const expectedRole = role === "member" ? "client" : role;
    return this.getCurrentSession()?.user.role === expectedRole;
  },
};

export function login(input: { email: string; password?: string; role: Exclude<UserRole, "admin"> }) {
  return authApi.login(input);
}

export function registerMember(input: { email: string; name?: string; password?: string }) {
  return authApi.registerMember(input);
}

export function getMemberSession() {
  return authApi.getMemberSession();
}

export function getTrainerSession() {
  return authApi.getTrainerSession();
}

export function getCurrentSession() {
  return authApi.getCurrentSession();
}

export function logout() {
  authApi.logout();
}

export function clearMemberSession() {
  authApi.clearMemberSession();
}

export function clearTrainerSession() {
  authApi.clearTrainerSession();
}

export function setMemberSession(email: string) {
  return authApi.login({ email, role: "client" });
}

export function setTrainerSession(email: string) {
  return authApi.login({ email, role: "trainer" });
}
