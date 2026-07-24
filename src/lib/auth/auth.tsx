"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/db/supabase";

export type Role = "customer" | "admin" | "photographer";

export interface User {
  name: string; // дэлгэцэнд харуулах нэр = "Овог Нэр"
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  role: Role;
  tier?: string; // bronze | silver | gold | vip
}

interface AuthState {
  user: User | null;
  ready: boolean; // session уншиж дууссан эсэх
  logout: () => Promise<void>;
  update: (patch: Partial<User>) => Promise<void>;
  refresh: () => Promise<User | null>;
}

const Ctx = createContext<AuthState | null>(null);

// Идэвхтэй session → апп-ын User болгож ачаална (profiles + user_metadata).
async function loadUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  // Токеныг серверт шалгах — хэрэглэгч устсан/хүчингүй бол цэвэрлэнэ (stale session).
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  if (error || !authUser) {
    await supabase.auth.signOut().catch(() => {});
    return null;
  }

  const { data: prof } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
  const meta = (authUser.user_metadata ?? {}) as Record<string, string>;
  const first = prof?.first_name ?? meta.first_name ?? "";
  const last = prof?.last_name ?? meta.last_name ?? "";
  const name = prof?.name ?? meta.name ?? [last, first].filter(Boolean).join(" ").trim();
  const role = (prof?.role as Role) ?? "customer";

  return {
    name: name || (authUser.email ?? ""),
    firstName: first || undefined,
    lastName: last || undefined,
    phone: prof?.phone ?? meta.phone ?? "",
    email: authUser.email ?? prof?.email ?? undefined,
    role,
    // Админ хэрэглэгч бүр автоматаар VIP түвшинтэй
    tier: role === "admin" ? "vip" : (prof?.tier ?? "bronze"),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const u = await loadUser();
    setUser(u);
    return u;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await loadUser();
      if (mounted) { setUser(u); setReady(true); }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const u = await loadUser();
      if (mounted) setUser(u);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const update = useCallback(async (patch: Partial<User>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const row: Record<string, string> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.firstName !== undefined) row.first_name = patch.firstName;
    if (patch.lastName !== undefined) row.last_name = patch.lastName;
    if (patch.phone !== undefined) row.phone = patch.phone;
    if (patch.email !== undefined) row.email = patch.email;
    await supabase.from("profiles").update(row).eq("id", session.user.id);
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  return (
    <Ctx.Provider value={{ user, ready, logout, update, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
