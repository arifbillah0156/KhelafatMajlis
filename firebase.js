import { initializeApp, getApps } from "firebase/app"; // ✅ getApps must be here
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCzVb4TnD_FW2FgcZ31Y32EOTjEwA9pvqY",
    authDomain: "khelafatmajlis-ba62c.firebaseapp.com",
    projectId: "khelafatmajlis-ba62c",
    storageBucket: "khelafatmajlis-ba62c.firebasestorage.app",
    messagingSenderId: "166404884940",
    appId: "1:166404884940:web:609caaf18b643403737569",
    measurementId: "G-4ZZES23SVG"
};

// ✅ Safe initialization - prevents duplicate app error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export { db };