import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from "react";
import { adminApi, type Session } from "@/lib/api";
import type { User } from "@/lib/types";

const KEY = "kwoka-admin-session";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      login: async (email, password) => {
        const next = await adminApi.login(email, password);
        localStorage.setItem(KEY, JSON.stringify(next));
        setSession(next);
      },
      logout: () => {
        localStorage.removeItem(KEY);
        setSession(null);
      },
    }),
    [session],
  );
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
