"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthChange, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/lib/types";

// UserRole redefined for the context if necessary, but we'll use the type from types.ts
type AuthRole = UserRole | "checking" | null;

interface AuthContextType {
  user: User | null;
  role: AuthRole;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthRole>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;
    
    const authUnsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        // Cleanup previous profile listener
        if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
        }

        if (firebaseUser) {
          if (!role || role === "checking") {
            setRole("checking");
          }
          
          // Use onSnapshot for real-time profile updates (includes preferences)
          const userDocRef = doc(db, "users", firebaseUser.uid);
                    profileUnsubscribe = onSnapshot(userDocRef, async (userSnap: any) => {
            if (userSnap.exists()) {
              const userData = userSnap.data() as UserProfile;
              setRole(userData.role);
              setProfile(userData);
              setLoading(false);

              // Auto-sync session cookie for middleware
              firebaseUser.getIdToken().then((idToken) => {
                fetch('/api/auth/session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken, role: userData.role, organizationId: userData.organizationId }),
                }).catch(() => {});
              }).catch(() => {});
            } else {
              setRole(null);
              setProfile(null);
              setLoading(false);
            }
                    }, (err: any) => {
            if (err.code !== 'permission-denied') {
              console.error("Profile snapshot error:", err);
            }
            setLoading(false);
          });
        } else {
          setRole(null);
          setProfile(null);
          setLoading(false);
          // Clean up session cookie on logout
          fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
        }
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
          console.error("Error setting up auth listener:", error);
        }
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
