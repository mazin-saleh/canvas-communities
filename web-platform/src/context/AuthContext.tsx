// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = { id: string; name: string; platformRole?: string | null };

type AuthCtx = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  onboarded: boolean;
  completeOnboarding: () => Promise<void>; // <- now returns Promise<void>
  hydrated: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

const KEY = "cc_auth";

type StoredAuthPayload = {
  user: User | null;
  onboarded: boolean;
};

function readStoredAuth(): StoredAuthPayload {
  if (typeof window === "undefined") {
    return { user: null, onboarded: false };
  }

  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return { user: null, onboarded: false };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthPayload>;
    return {
      user: parsed.user ?? null,
      onboarded: parsed.onboarded ?? false,
    };
  } catch (error) {
    console.warn("[AuthContext] failed parsing localStorage", error);
    return { user: null, onboarded: false };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialAuth = readStoredAuth();
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [onboarded, setOnboarded] = useState(initialAuth.onboarded);
  const hydrated = true;

  useEffect(() => {
    async function hydratePlatformRole() {
      if (!user) {
        return;
      }

      try {
        const access = await api.user.getAccess(Number(user.id));
        setUser((current) => {
          if (!current) {
            return current;
          }

          if (current.platformRole === access.user.platformRole) {
            return current;
          }

          const nextUser = { ...current, platformRole: access.user.platformRole };
          const payload = { user: nextUser, onboarded };
          localStorage.setItem(KEY, JSON.stringify(payload));
          return nextUser;
        });
      } catch (error) {
        console.warn("[AuthContext] failed hydrating platformRole", error);
      }
    }

    if (hydrated) {
      void hydratePlatformRole();
    }
  }, [hydrated, onboarded, user]);

  // instrumentation: log when user/onboarded changes
  useEffect(() => {
    console.log("[AuthContext] user/onboarded changed", { user, onboarded, hydrated });
  }, [user, onboarded, hydrated]);

  function login(u: User) {
    const payload = { user: u, onboarded: false };
    localStorage.setItem(KEY, JSON.stringify(payload));
    setUser(u);
    setOnboarded(false);
    console.log("[AuthContext] login", u);
  }

  function logout() {
    localStorage.removeItem(KEY);
    setUser(null);
    setOnboarded(false);
    console.log("[AuthContext] logout");
  }

  function completeOnboarding(): Promise<void> {
    // set local storage and state, then return a resolved Promise so callers can await.
    const payload = { user, onboarded: true };
    try {
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("[AuthContext] completeOnboarding localStorage write failed", e);
    }

    setOnboarded(true);
    console.log("[AuthContext] completeOnboarding called - onboarded set to true");
    return Promise.resolve();
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, onboarded, completeOnboarding, hydrated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};