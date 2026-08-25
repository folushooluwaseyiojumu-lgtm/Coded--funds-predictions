import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("✅ Login successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error("Firebase Login Error:", error);

        alert(
            "❌ Login failed: " +
            error.code +
            "\n\n" +
            error.message
        );

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";

    }

});
