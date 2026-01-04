import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, updateEmail, updatePassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
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
const storage = getStorage(app);
const genAI = getAI(app, { backend: new GoogleAIBackend() });

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
  return userCredential;
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

export { auth, db, storage, genAI };
export default app;
