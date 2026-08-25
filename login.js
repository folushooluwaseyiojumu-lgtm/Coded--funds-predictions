import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async function () {

    const email = document.querySelector('input[type="email"]').value.trim();
    const password = document.querySelector('input[type="password"]').value;

    console.log("Login button clicked");
    console.log("Email:", email);

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("Login successful:", userCredential.user);

        alert("✅ Login successful!");

        window.location.href = "admin.html";

    } catch (error) {

        console.error("Firebase Login Error:", error);
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);

        alert(
            "Login failed!\n\n" +
            "Code: " + error.code + "\n" +
            "Message: " + error.message
        );

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }

});
