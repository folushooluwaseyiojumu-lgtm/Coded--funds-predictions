import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const email = document.querySelector('input[type="email"]');
const password = document.querySelector('input[type="password"]');
const button = document.querySelector("button");

button.addEventListener("click", async () => {
    try {
        await signInWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        alert("Login successful!");
        window.location.href = "VIP.html";
    } catch (error) {
        alert(error.message);
    }
});