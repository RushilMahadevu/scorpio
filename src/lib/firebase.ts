// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

export default app;