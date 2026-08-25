import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async function () {

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

        alert("Login successful!");

        window.location.href = "admin.html";

    } catch (error) {

        console.error(error);

        alert(
            "Login failed:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );

        loginBtn.disabled = false;
        loginBtn.textContent = "🔐 Login";
    }

});
