"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { onAuthChange, db } from "@/lib/firebase";

type UserRole = "teacher" | "student" | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Check if teacher
          const teacherDoc = await getDoc(doc(db, "teachers", firebaseUser.uid));
          if (teacherDoc.exists()) {
            setRole("teacher");
          } else {
            // Check if student
            const studentDoc = await getDoc(doc(db, "students", firebaseUser.uid));
            if (studentDoc.exists()) {
              setRole("student");
            } else {
              setRole(null);
            }
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
