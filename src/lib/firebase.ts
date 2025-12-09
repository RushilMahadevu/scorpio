import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
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

// File conversion functions (no storage needed - works with free Spark plan)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export interface WorkFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
  uploadedAt: Date;
}

export const convertFilesToBase64 = async (files: File[]): Promise<WorkFile[]> => {
  const convertedFiles: WorkFile[] = [];
  for (const file of files) {
    const base64Data = await fileToBase64(file);
    convertedFiles.push({
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64Data,
      uploadedAt: new Date(),
    });
  }
  return convertedFiles;
};

export { auth, db, genAI };
export default app;
