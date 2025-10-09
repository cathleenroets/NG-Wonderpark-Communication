// Firebase Auth setup using CDN modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMQ2Scn4Bwe3LreQ3X9_6dCuEBK8cR2YI",
  authDomain: "kerk-c847c.firebaseapp.com",
  projectId: "kerk-c847c",
  storageBucket: "kerk-c847c.firebasestorage.app",
  messagingSenderId: "779898611341",
  appId: "1:779898611341:web:75e7c2053520e1ba5c24c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign Up
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("🎉 Account created successfully!");
      window.location.href = "index.html";
    } catch (error) {
      alert("⚠️ " + error.message);
    }
  });
}

// Sign In
const signinForm = document.getElementById("signin-form");
if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Signed in successfully!");
      window.location.href = "index.html";
    } catch (error) {
      alert("⚠️ " + error.message);
    }
  });
}

// (Optional) Sign Out button logic
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("👋 Logged out successfully!");
    window.location.href = "signin.html";
  });
}
