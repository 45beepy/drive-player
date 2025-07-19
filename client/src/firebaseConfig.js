// y2k-drive-player/client/src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyDTVVQLmv3Qmwe_E_LlqZle2Uspf5ckJVM",
    authDomain: "drive-player-c5f88.firebaseapp.com",
    projectId: "drive-player-c5f88",
    storageBucket: "drive-player-c5f88.firebasestorage.app",
    messagingSenderId: "110906230183",
    appId: "1:110906230183:web:c35b6d83bf98eb6d4e2282",
    // measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');

// --- CRITICAL FIX: Add GoogleAuthProvider to the export list ---
export { auth, googleProvider, signInWithPopup, signOut, GoogleAuthProvider };