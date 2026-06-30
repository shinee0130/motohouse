"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "customer" | "admin";

export interface User {
  name: string; // дэлгэцэнд харуулах нэр = "Овог Нэр"
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  role: Role;
}

// Demo бүртгэлүүд (backend холбогдох хүртэл). Нууц үг бүгд "1234".
export const ADMIN_PHONE = "80808080";
export const DEMO_ACCOUNTS: { phone: string; name: string; role: Role }[] = [
  { phone: ADMIN_PHONE, name: "Админ", role: "admin" },
  { phone: "99119911", name: "Райдер", role: "customer" },
];

// Утасны дугаараар demo role тодорхойлох.
export function resolveDemo(phone: string): { name: string; role: Role } {
  const found = DEMO_ACCOUNTS.find((a) => a.phone === phone);
  return found ? { name: found.name, role: found.role } : { name: "Райдер", role: "customer" };
}

interface AuthState {
  user: User | null;
  ready: boolean; // localStorage уншиж дууссан эсэх (hydration-safe)
  login: (u: User) => void;
  logout: () => void;
  update: (patch: Partial<User>) => void;
}

const STORAGE_KEY = "mh_user";
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        if (!u.role) u.role = "customer";
        setUser(u);
      }
    } catch {}
    setReady(true);
  }, []);

  function persist(u: User | null) {
    setUser(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  const value: AuthState = {
    user,
    ready,
    login: (u) => persist(u),
    logout: () => persist(null),
    update: (patch) => persist({ ...(user as User), ...patch }),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
