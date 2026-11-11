"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import type { UserProfile, UserRole } from "@/lib/types";

type AuthRole = UserRole | "checking" | null;

interface AuthState {
  user: User | null;
  role: AuthRole;
  profile: UserProfile | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  role: null,
  profile: null,
  loading: true,
};

const AuthContext = createContext(initialState);

export function AuthProvider({ children, needsAuth }: { children: ReactNode; needsAuth: boolean }) {
  const [state, setState] = useState(initialState);
  const [started, setStarted] = useState(needsAuth);

  // After an app route starts auth, keep the session listener across navigation.
  if (needsAuth && !started) setStarted(true);

  useEffect(() => {
    if (!started) return;

    let disposed = false;
    let authUnsubscribe: (() => void) | undefined;
    let profileUnsubscribe: (() => void) | undefined;

    async function connect() {
      const [{ onAuthChange, db, auth }, { doc, onSnapshot }] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/firestore"),
      ]);
      if (disposed) return;

      authUnsubscribe = onAuthChange((user) => {
        profileUnsubscribe?.();
        profileUnsubscribe = undefined;

        if (!user) {
          setState({ ...initialState, loading: false });
          fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
          return;
        }

        setState({ user, role: "checking", profile: null, loading: true });
        profileUnsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
          const profile = snapshot.exists() ? (snapshot.data() as UserProfile) : null;
          setState({ user, role: profile?.role ?? null, profile, loading: false });

          if (profile) {
            user.getIdToken().then((idToken) => {
              if (disposed || auth.currentUser !== user) return;
              return fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken, role: profile.role, organizationId: profile.organizationId }),
              });
            }).catch(() => {});
          }
        }, (error) => {
          if (error.code !== "permission-denied") console.error("Profile snapshot error:", error);
          setState({ user, role: null, profile: null, loading: false });
        });
      });
    }

    connect().catch((error) => {
      if (disposed) return;
      console.error("Error setting up auth listener:", error);
      setState({ ...initialState, loading: false });
    });

    return () => {
      disposed = true;
      authUnsubscribe?.();
      profileUnsubscribe?.();
    };
  }, [started]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
