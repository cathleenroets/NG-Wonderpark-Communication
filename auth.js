// Firebase Auth setup using CDN modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Firebase configuration
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

// Admin emails
const adminEmails = ["cathleen.roets@gmail.com"];

// Update navbar based on auth state
onAuthStateChanged(auth, (user) => {
  const authLinks = document.querySelector(".auth-links");
  const adminLink = document.querySelector(".admin-link");

  // Always hide admin link first
  if (adminLink) {
    adminLink.style.display = "none";
  }

  if (authLinks) {
    if (user) {
      // Show admin link if email matches
      if (adminLink && adminEmails.includes(user.email)) {
        adminLink.style.display = "block";
      }

      authLinks.innerHTML = `
        <span>Welcome, ${user.displayName || "Member"}</span>
        <button id="logout-btn" class="btn-auth">Sign Out</button>
      `;

      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          try {
            await signOut(auth);
            alert("👋 Logged out successfully!");
            window.location.href = "signin.html";
          } catch (error) {
            alert("⚠️ " + error.message);
          }
        });
      }
    } else {
      authLinks.innerHTML = `
        <a href="signin.html" class="btn-auth">Sign In</a>
        <a href="signup.html" class="btn-auth btn-signup">Sign Up</a>
      `;
    }
  }
});

// Sign Up
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signup-username")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim();
    const password = document.getElementById("signup-password")?.value.trim();
    const signupBtn = document.getElementById("signup-btn");

    if (!username || !email || !password) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("⚠️ Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("⚠️ Password must be at least 6 characters.");
      return;
    }

    signupBtn.disabled = true;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });

      alert("🎉 Account created successfully!");
      window.location.href = "index.html";
    } catch (error) {
      alert("⚠️ " + error.message);
    } finally {
      signupBtn.disabled = false;
    }
  });
}

// Sign In
const signinForm = document.getElementById("signin-form");
if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signin-email")?.value.trim();
    const password = document.getElementById("signin-password")?.value.trim();
    const signinBtn = document.getElementById("signin-btn");

    if (!email || !password) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("⚠️ Please enter a valid email address.");
      return;
    }

    signinBtn.disabled = true;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert(`✅ Welcome back, ${userCredential.user.displayName || "Member"}!`);
      window.location.href = "index.html";
    } catch (error) {
      alert("⚠️ " + error.message);
    } finally {
      signinBtn.disabled = false;
    }
  });
}
