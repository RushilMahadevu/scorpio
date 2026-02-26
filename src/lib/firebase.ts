import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, writeBatch, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
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
  
  // Create user document in Unified collection (Phase 2.1)
  const userData: any = {
    uid: user.uid,
    email: user.email,
    displayName: name,
    role: role,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  let resolvedTeacherId = classCode || null;
  let resolvedCourseId = null;

  if (role === "student" && classCode) {
    try {
      // Try to resolve classCode to a course first
      const coursesSnap = await getDocs(query(collection(db, "courses"), where("code", "==", classCode.trim())));
      if (!coursesSnap.empty) {
        const courseData = coursesSnap.docs[0].data();
        resolvedTeacherId = courseData.teacherId;
        resolvedCourseId = coursesSnap.docs[0].id;
      }
    } catch (e) { console.error("Error resolving class code during registration", e); }
    
    userData.teacherId = resolvedTeacherId;
    userData.courseId = resolvedCourseId;
  }

  // Update unified collection
  await setDoc(doc(db, "users", user.uid), userData);

  // Sync back to legacy for compatibility if needed (Optional, but safer for now)
  const legacyCollection = role === "teacher" ? "teachers" : "students";
  const legacyData: any = {
    uid: user.uid,
    email: user.email,
    name: name,
    role: role,
    createdAt: new Date(),
  };

  if (role === "student") {
    legacyData.teacherId = resolvedTeacherId;
    legacyData.courseId = resolvedCourseId;
  }

  await setDoc(doc(db, legacyCollection, user.uid), legacyData);

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

/**
 * Deletes all submissions and stored files for a specific student to save storage space.
 * 
 * @param studentId The UID of the student
 * @param courseId Optional course ID to target specific class data (if provided)
 */
export async function cleanupStudentData(studentId: string, courseId?: string) {
  try {
     // 1. Determine which submissions to delete
     let submissionDocs: any[] = [];
     
     if (courseId) {
        // Find all assignments for this course
        const assignmentsSnap = await getDocs(query(collection(db, "assignments"), where("courseId", "==", courseId)));
        const assignmentIds = assignmentsSnap.docs.map(d => d.id);
        
        if (assignmentIds.length === 0) return;

        // Find submissions for this student belonging to these assignments
        // Note: 'where in' is limited to 30 items.
        const chunks = [];
        for (let i = 0; i < assignmentIds.length; i += 30) {
            chunks.push(assignmentIds.slice(i, i + 30));
        }

        for (const chunk of chunks) {
            const q = query(collection(db, "submissions"), where("studentId", "==", studentId), where("assignmentId", "in", chunk));
            const snap = await getDocs(q);
            submissionDocs.push(...snap.docs);
        }
     } else {
        // Delete all submissions for this student
        const q = query(collection(db, "submissions"), where("studentId", "==", studentId));
        const snapshot = await getDocs(q);
        submissionDocs = snapshot.docs;
     }

     if (submissionDocs.length === 0) return;

     const batch = writeBatch(db);
     const storageTasks: Promise<void>[] = [];
     
     submissionDocs.forEach((subDoc) => {
        const data = subDoc.data();
        
        // 2. Iterate and delete files from storage
        if (data.workFiles && Array.isArray(data.workFiles)) {
           data.workFiles.forEach((file: WorkFile) => {
              if (file.url) {
                 try {
                  const fileRef = ref(storage, file.url);
                  storageTasks.push(deleteObject(fileRef).catch(e => console.warn(`Failed to delete storage file ${file.url}:`, e)));
                 } catch (e) {
                   console.warn("Invalid storage URL in cleanup:", file.url);
                 }
              }
           });
        }
        batch.delete(subDoc.ref);
     });

     // 3. Execute deletions
     await Promise.all(storageTasks);
     await batch.commit();

  } catch (error) {
    console.error("Error cleaning up student data:", error);
    throw error;
  }
}

/**
 * Completely removes a user's entire account including all stored data (submissions, storage files, profile).
 * Should be called while the user is still logged in (to delete Auth account) or by an admin.
 */
export async function deleteFullAccount(uid: string, role: string) {
    try {
        // 1. Data Cleanup (Student specific)
        if (role === 'student' || role === 'checking') {
            await cleanupStudentData(uid);
            await deleteDoc(doc(db, "students", uid)).catch(() => {});
        }

        // 2. Data Cleanup (Teacher specific)
        if (role === 'teacher') {
            const batch = writeBatch(db);
            // Delete assignments
            const assignmentsSnap = await getDocs(query(collection(db, "assignments"), where("teacherId", "==", uid)));
            assignmentsSnap.forEach(d => batch.delete(d.ref));
            
            // Delete courses
            const coursesSnap = await getDocs(query(collection(db, "courses"), where("teacherId", "==", uid)));
            coursesSnap.forEach(d => batch.delete(d.ref));
            
            await batch.commit();
            await deleteDoc(doc(db, "teachers", uid)).catch(() => {});
        }

        // 3. Delete Unified user doc
        await deleteDoc(doc(db, "users", uid));
        
        // 4. Finally, try to delete the Auth record if it's the current user
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
            await deleteUser(currentUser);
        }
    } catch (error) {
        console.error("Full account deletion error:", error);
        throw error;
    }
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

// Utility for Google sign-in (OAuth for teachers)
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
export const signInWithGoogleForTeacher = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/forms.body.readonly");
  const result = await signInWithPopup(auth, provider);
  
  // Unified Users collection sync (Phase 2.1)
  const userData = {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName || result.user.email || "Unknown Teacher",
    role: "teacher" as const,
    lastLoginAt: new Date(),
  };

  await setDoc(doc(db, "users", result.user.uid), userData, { merge: true });

  // Legacy sync
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
