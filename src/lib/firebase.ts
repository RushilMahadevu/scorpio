import { initializeApp, getApps } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, getToken } from "firebase/app-check";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, writeBatch, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { getAI, GoogleAIBackend } from "firebase/ai";
import { UserProfile, UserRole } from "./types";
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

// Initialize App Check (client-side only, before Firebase AI / Vertex AI initialization)
let appCheck: any = null;
if (typeof window !== "undefined") {
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN) {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN === "true"
        ? true
        : (process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN || true);
  }

  const recaptchaKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    "6LdmeKAtAAAAAJl2vM5DGedgtV3rH2Y0d_F3JR-u";

  if (recaptchaKey) {
    try {
      const isEnterprise = process.env.NEXT_PUBLIC_RECAPTCHA_PROVIDER !== "v3";
      appCheck = initializeAppCheck(app, {
        provider: isEnterprise
          ? new ReCaptchaEnterpriseProvider(recaptchaKey)
          : new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });

      // Immediately request token to warm up App Check and register executes in Google Cloud Console
      getToken(appCheck, false)
        .then((tok) => {
          if (tok?.token) {
            console.log("[Firebase App Check] Token generated successfully.");
          }
        })
        .catch((e) => {
          console.warn("[Firebase App Check] Initial token fetch error:", e);
        });
    } catch (e) {
      console.warn("[Firebase App Check] Initialization failed:", e);
    }
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let _genAI: any = null;
export function getGenAIInstance() {
  if (!_genAI) {
    _genAI = getAI(app, {
      backend: new GoogleAIBackend(),
      useLimitedUseAppCheckTokens: true,
    });
  }
  return _genAI;
}

const genAI = new Proxy({} as ReturnType<typeof getAI>, {
  get(target, prop, receiver) {
    const instance = getGenAIInstance();
    const val = Reflect.get(instance, prop, receiver);
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  }
});

// --- File Upload Helpers ---
export type WorkFile = {
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt?: string | number | Date;
};

/**
 * Compresses an image file to reduce file size while maintaining quality
 * @param file The image file to compress
 * @param maxWidth Maximum width in pixels (default: 1920)
 * @param maxHeight Maximum height in pixels (default: 1080)
 * @param quality JPEG quality (0-1, default: 0.8)
 * @returns Promise<File> Compressed image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Uploads an array of File objects to Firebase Storage with automatic image compression
 * @param files File[]
 * @param userId User ID for organizing files in Storage
 * @param onProgress Optional progress callback (fileIndex, progressPercent)
 * @returns Promise<WorkFile[]>
 */
export async function uploadFilesToStorage(
  files: File[],
  userId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<WorkFile[]> {
  const uploadPromises = files.map(async (file, index) => {
    let fileToUpload = file;

    // Compress images automatically
    if (file.type.startsWith('image/')) {
      try {
        onProgress?.(index, 10); // 10% for compression
        
        // More aggressive compression for larger files
        let quality = 0.8;
        let maxWidth = 1920;
        let maxHeight = 1080;
        
        if (file.size > 2 * 1024 * 1024) { // > 2MB
          quality = 0.6;
          maxWidth = 1600;
          maxHeight = 900;
        } else if (file.size > 1024 * 1024) { // > 1MB
          quality = 0.7;
          maxWidth = 1800;
          maxHeight = 1000;
        }
        
        fileToUpload = await compressImage(file, maxWidth, maxHeight, quality);
        console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
        onProgress?.(index, 20); // 20% after compression
      } catch (error) {
        console.warn(`Failed to compress ${file.name}, uploading original:`, error);
        fileToUpload = file;
      }
    }

    // Create a unique filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = fileToUpload.name.split('.').pop() || '';
    const baseName = fileToUpload.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const fileName = `${timestamp}_${baseName}.${fileExtension}`;
    const storageRef = ref(storage, `submissions/${userId}/${fileName}`);

    // Upload the file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    return new Promise<WorkFile>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 80 + 20; // 20-100%
          onProgress?.(index, progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            // Get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.(index, 100);

            resolve({
              name: file.name, // Keep original filename for display
              type: file.type,
              size: fileToUpload.size, // Use compressed size
              url: downloadURL,
              uploadedAt: new Date(),
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  });

  return Promise.all(uploadPromises);
}

/**
 * Legacy function for backward compatibility - converts files to base64.
 * @deprecated Use uploadFilesToStorage instead for better performance and storage limits.
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
          url: reader.result as string, // Using url field for backward compatibility
          uploadedAt: new Date(),
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  return Promise.all(files.map(fileToBase64));
}


// Auth functions
export const register = async (email: string, password: string, role: "teacher" | "student", name: string, code?: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await credential.user.getIdToken()}` },
      body: JSON.stringify({ role, name, code }),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Registration failed');
    return credential;
  } catch (error) {
    await deleteUser(credential.user).catch(() => {});
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  await fetch('/api/auth/session', { method: 'DELETE' });
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Deletes all submissions and stored files for a specific student to save storage space.
 * 
 * @param studentId The UID of the student
 * @param courseId Optional course ID to target specific class data (if provided)
 */
export async function cleanupStudentData(studentId: string, courseId?: string, unlink = false) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in first');
  const response = await fetch('/api/teacher/students/cleanup', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ studentId, courseId, unlink }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Cleanup failed');
}

/**
 * Completely removes a user's entire account including all stored data (submissions, storage files, profile).
 * Should be called while the user is still logged in (to delete Auth account) or by an admin.
 */
export async function deleteFullAccount(uid: string, role: string) {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) throw new Error('Sign in to delete your account');
  const response = await fetch('/api/account', { method: 'DELETE', headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
  if (!response.ok) throw new Error((await response.json()).error);
  await logout();
}

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

/**
 * Updates a user's profile in the unified collection.
 * 
 * @param uid The UID of the user
 * @param data Changes to apply to the user profile
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

// Utility for Google sign-in (OAuth for teachers)
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
export const signInWithGoogleForTeacher = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/forms.body.readonly");
  const result = await signInWithPopup(auth, provider);
  
  const profile = await getDoc(doc(db, "users", result.user.uid));
  if (!profile.exists() || profile.data().role !== "teacher") {
    await signOut(auth);
    throw new Error("Register with a teacher invite code before using Google sign-in.");
  }
  return result.user;
};

export { auth, db, storage, genAI, appCheck };
export default app;
