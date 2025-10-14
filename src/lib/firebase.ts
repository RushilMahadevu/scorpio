// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs 
} from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD09EUMBmbJb8d6AlIpsJvFFnQxdFi5MVM",
  authDomain: "scorpio-srs.firebaseapp.com",
  projectId: "scorpio-srs",
  storageBucket: "scorpio-srs.firebasestorage.app",
  messagingSenderId: "247809684573",
  appId: "1:247809684573:web:2850103cc100bb6fa409b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const firebaseApp = initializeApp(firebaseConfig);
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });


// Authentication functions
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// Admin management functions
export const createAdminUser = async (email: string, password: string, displayName: string) => {
  try {
    // Create a new user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName });
    
    // Store admin metadata in Firestore
    await setDoc(doc(db, "admins", user.uid), {
      email,
      displayName,
      role: "admin",
      createdAt: new Date(),
      active: true
    });
    
    return user;
  } catch (error) {
    console.error("Create admin error:", error);
    throw error;
  }
};

// Get all admin users from Firestore
export const getAdminUsers = async () => {
  try {
    const adminsRef = collection(db, "admins");
    const querySnapshot = await getDocs(adminsRef);
    
    const admins = [];
    querySnapshot.forEach((doc) => {
      admins.push({ id: doc.id, ...doc.data() });
    });
    
    return admins;
  } catch (error) {
    console.error("Get admin users error:", error);
    throw error;
  }
};

// Check if the current user is an admin
export const checkIsAdmin = async (userId) => {
  try {
    const adminRef = doc(db, "admins", userId);
    const adminDoc = await getDoc(adminRef);
    return adminDoc.exists();
  } catch (error) {
    console.error("Check admin error:", error);
    return false;
  }
};

export { auth, db, model, ai };
export default app;