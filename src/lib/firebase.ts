import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, updateEmail, updatePassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAI, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Initialize Firebase (prevent multiple instances)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const genAI = getAI(app, { backend: new GoogleAIBackend() });

// --- File Upload Helpers ---
export type WorkFile = {
  name: string;
  type: string;
  size: number;
  base64: string;
  uploadedAt?: string | number | Date;
};

/**
 * Converts an array of File objects to an array of WorkFile objects with base64 data.
 * @param files File[]
 * @returns Promise<WorkFile[]>
 */
export async function convertFilesToBase64(files: File[]): Promise<WorkFile[]> {
  // Helper to convert a single file
  function fileToBase64(file: File): Promise<WorkFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  return Promise.all(files.map(fileToBase64));
}


// Auth functions
export const register = async (email: string, password: string, role: "teacher" | "student", name: string, classCode?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Create user document in Firestore
  const collectionName = role === "teacher" ? "teachers" : "students";
  const userData: any = {
    uid: user.uid,
    email: user.email,
    name: name,
    role: role,
    createdAt: new Date(),
  };
  if (role === "student" && classCode) {
    userData.teacherId = classCode;
  }
  await setDoc(doc(db, collectionName, user.uid), userData);
  return user;
};

export const login = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const changeEmail = async (newEmail: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return updateEmail(user, newEmail);
};

export const changePassword = async (newPassword: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return updatePassword(user, newPassword);
};

// Utility for Google sign-in (OAuth for teachers)
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
export const signInWithGoogleForTeacher = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/forms.body.readonly");
  const result = await signInWithPopup(auth, provider);
  // Optionally, create teacher doc if not exists
  const teacherDocRef = doc(db, "teachers", result.user.uid);
  const teacherDocSnap = await getDoc(teacherDocRef);
  if (!teacherDocSnap.exists()) {
    await setDoc(teacherDocRef, {
      uid: result.user.uid,
      email: result.user.email,
      name: result.user.displayName || result.user.email,
      role: "teacher",
      createdAt: new Date(),
    });
  }
  return result.user;
};

export { auth, db, genAI };
export default app;
