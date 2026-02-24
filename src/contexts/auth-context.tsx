"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          setRole("checking");
          
          // 1. Check unified User Collection (Strategic Target - Phase 2.1)
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setRole(userData.role);
            setProfile(userData);
          } else {
            // 2. Legacy Check: Migrate logic locally if needed
            // Check if teacher
            const teacherDoc = await getDoc(doc(db, "teachers", firebaseUser.uid));
            if (teacherDoc.exists()) {
              const teacherData = teacherDoc.data();
              const newProfile: Partial<UserProfile> = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || teacherData.name || "Unknown Teacher",
                role: "teacher",
                createdAt: teacherData.createdAt || serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                classIds: [],
              };
              
              // Only migrate if we have a name/email to work with efficiently
              await setDoc(doc(db, "users", firebaseUser.uid), newProfile, { merge: true });
              setRole("teacher");
              setProfile(newProfile as UserProfile);
            } else {
              // Check if student
              const studentDoc = await getDoc(doc(db, "students", firebaseUser.uid));
              if (studentDoc.exists()) {
                setRole("student");
                // Optional: Migrate students too if needed for network features
              } else {
                setRole(null);
              }
            }
          }
        } else {
          setRole(null);
          setProfile(null);
        }
      } catch (error: any) {
        // Only log errors that are not expected (like permission denied for missing profile)
        if (error?.code !== 'permission-denied') {
          console.error("Error fetching user role:", error);
        }
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
