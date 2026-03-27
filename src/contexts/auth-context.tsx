"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
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
            } else {
              // Fallback to legacy check if unified doc doesn't exist yet
              // Check if teacher
              const teacherDoc = await getDoc(doc(db, "teachers", firebaseUser.uid));
              if (teacherDoc.exists()) {
                const teacherData = teacherDoc.data();
                const newProfile: Partial<UserProfile> = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  displayName: firebaseUser.displayName || teacherData.name || "Unknown Teacher",
                  role: "teacher",
                  createdAt: (teacherData.createdAt || serverTimestamp()) as unknown as Date,
                  lastLoginAt: serverTimestamp() as unknown as Date,
                  classIds: [],
                };
                await setDoc(doc(db, "users", firebaseUser.uid), newProfile, { merge: true });
                setRole("teacher");
                setProfile(newProfile as UserProfile);
              } else {
                // Check if student
                const studentDoc = await getDoc(doc(db, "students", firebaseUser.uid));
                if (studentDoc.exists()) {
                  const studentData = studentDoc.data();
                  const newProfile: Partial<UserProfile> = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    displayName: firebaseUser.displayName || studentData.name || "Unknown Student",
                    role: "student",
                    teacherId: studentData.teacherId || null,
                    courseId: studentData.courseId || null,
                    schoolId: studentData.schoolId || null,
                    createdAt: (studentData.createdAt || serverTimestamp()) as unknown as Date,
                    lastLoginAt: serverTimestamp() as unknown as Date,
                  };
                  await setDoc(doc(db, "users", firebaseUser.uid), newProfile, { merge: true });
                  setRole("student");
                  setProfile(newProfile as UserProfile);
                } else {
                  setRole(null);
                  setLoading(false);
                }
              }
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
