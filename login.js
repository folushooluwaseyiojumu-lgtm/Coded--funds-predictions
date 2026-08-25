import { auth } from "./firebase.js";

console.log("✅ login.js loaded");
console.log("Firebase auth:", auth);

const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

loginBtn.addEventListener("click", async () => {

    console.log("✅ Login button clicked");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        console.log("Attempting Firebase login...");

        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("✅ Firebase login successful:", result.user);

        alert("Login successful!");

        window.location.href = "admin.html";

    } catch (error) {

        console.error("❌ Firebase Login Error");
        console.error("Code:", error.code);
        console.error("Message:", error.message);

        alert(
            "LOGIN FAILED\n\n" +
            "Code: " + error.code +
            "\n\n" +
            "Message: " + error.message
        );

        loginBtn.disabled = false;
        loginBtn.textContent = "🔐 Login";
    }

});

But there is one missing import in that test. Use this complete version instead:
