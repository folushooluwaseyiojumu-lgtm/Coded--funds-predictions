import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

console.log("LOGIN JS LOADED");
console.log("Firebase Auth:", auth);

loginBtn.addEventListener("click", async () => {

    console.log("LOGIN BUTTON CLICKED");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    console.log("Email:", email);

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        console.log("Connecting to Firebase...");

        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("LOGIN SUCCESS:", result.user);

        alert("Login successful!");

        window.location.href = "admin.html";

    } catch (error) {

        console.error("FULL FIREBASE ERROR:", error);

        alert(
            "LOGIN ERROR\n\n" +
            "Code: " + error.code +
            "\n\nMessage: " + error.message
        );

        loginBtn.disabled = false;
        loginBtn.textContent = "🔐 Login";
    }

});
