import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const registerBtn = document.getElementById("registerBtn");


registerBtn.addEventListener("click", async () => {

    const fullName =
        document.getElementById("fullname").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    if (!fullName || !email || !password || !confirmPassword) {

        alert("Please fill in all fields.");

        return;
    }


    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;
    }


    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        // Create the user's Firestore profile

        await setDoc(
            doc(db, "users", user.uid),
            {
                fullName: fullName,
                email: user.email,
                membershipStatus: "not_active"
            }
        );


        alert("Account created successfully!");


        window.location.href = "login.html";


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});
