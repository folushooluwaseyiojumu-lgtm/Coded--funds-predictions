import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


console.log("login.js loaded");


const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");


console.log("Email input:", emailInput);
console.log("Password input:", passwordInput);
console.log("Login button:", loginBtn);


if (!emailInput || !passwordInput || !loginBtn) {

    alert(
        "Login page error: HTML elements were not found."
    );

} else {

    loginBtn.addEventListener("click", async () => {

        console.log("LOGIN BUTTON CLICKED");


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email) {

            alert("Please enter your email.");

            return;
        }


        if (!password) {

            alert("Please enter your password.");

            return;
        }


        loginBtn.disabled = true;

        loginBtn.textContent =
            "Logging in...";


        try {

            console.log(
                "Trying Firebase login..."
            );


            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            console.log(
                "Login successful:",
                userCredential.user.email
            );


            alert("✅ Login successful!");


            window.location.href =
                "admin.html";


        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );


            alert(
                "❌ Login failed:\n\n" +
                error.message
            );


            loginBtn.disabled = false;

            loginBtn.textContent =
                "Login";
        }

    });

}
