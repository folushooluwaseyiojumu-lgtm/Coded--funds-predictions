import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ===============================
// CHECK ADMIN LOGIN
// ===============================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }

    console.log("Admin logged in:", user.email);

    loadMatches();
    loadCountdown();
});


// ===============================
// SAVE COUNTDOWN
// ===============================

document
    .getElementById("saveCountdownBtn")
    .addEventListener("click", async () => {

        const homeTeam =
            document.getElementById("homeTeam").value.trim();

        const awayTeam =
            document.getElementById("awayTeam").value.trim();

        const matchDate =
            document.getElementById("matchDate").value;


        if (!homeTeam || !awayTeam || !matchDate) {

            alert("Please fill in all countdown fields.");

            return;
        }


        try {

            await setDoc(
                doc(db, "siteSettings", "countdown"),
                {
                    homeTeam: homeTeam,
                    awayTeam: awayTeam,
                    matchDate: matchDate,
                    updatedAt: serverTimestamp()
                }
            );


            alert("Countdown saved successfully!");


        } catch (error) {

            console.error(error);

            alert(
                "Could not save countdown: " +
                error.message
            );

        }

    });


// ===============================
// ADD MATCH
// ===============================

document
    .getElementById("addMatchBtn")
    .addEventListener("click", async () => {

        const home =
            document.getElementById("matchHome").value.trim();

        const away =
            document.getElementById("matchAway").value.trim();

        const status =
            document.getElementById("matchStatus").value;

        const time =
            document.getElementById("matchTime").value.trim();

        const score =
            document.getElementById("matchScore").value.trim();


        if (!home || !away) {

            alert("Please enter both teams.");

            return;
        }


        try {

            await addDoc(
                collection(db, "matches"),
                {
                    home: home,
                    away: away,
                    status: status,
                    time: time,
                    score: score,
                    createdAt: serverTimestamp()
                }
            );


            alert("Match added successfully!");


            document.getElementById("matchHome").value = "";
            document.getElementById("matchAway").value = "";
            document.getElementById("matchTime").value = "";
            document.getElementById("matchScore").value = "";


            loadMatches();


        } catch (error) {

            console.error(error);

            alert(
                "Could not add match: " +
                error.message
            );

        }

    });


// ===============================
// ADD RESULT
// ===============================

document
    .getElementById("addResultBtn")
    .addEventListener("click", async () => {

        const home =
            document.getElementById("resultHome").value.trim();

        const away =
            document.getElementById("resultAway").value.trim();

        const score =
            document.getElementById("resultScore").value.trim();

        const info =
            document.getElementById("resultInfo").value.trim();


        if (!home || !away || !score) {

            alert(
                "Please enter the teams and final score."
            );

            return;
        }


        try {

            await addDoc(
                collection(db, "results"),
                {
                    home: home,
                    away: away,
                    score: score,
                    info: info,
                    createdAt: serverTimestamp()
                }
            );


            alert("Result added successfully!");


            document.getElementById("resultHome").value = "";
            document.getElementById("resultAway").value = "";
            document.getElementById("resultScore").value = "";
            document.getElementById("resultInfo").value = "";


        } catch (error) {

            console.error(error);

            alert(
                "Could not add result: " +
                error.message
            );

        }

    });


// ===============================
// LOAD MATCHES
// ===============================

async function loadMatches() {

    const list =
        document.getElementById("matchesList");


    try {

        const snapshot =
            await getDocs(
                collection(db, "matches")
            );


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML =
                "<p>No matches added yet.</p>";

            return;
        }


        snapshot.forEach((matchDoc) => {

            const data = matchDoc.data();


            const card =
                document.createElement("div");

            card.className = "match-card";


            card.innerHTML = `

                <h3>
                    ${data.home} vs ${data.away}
                </h3>

                <p>
                    Status: ${data.status}
                </p>

                <p>
                    Time: ${data.time || "Not set"}
                </p>

                <p>
                    Score: ${data.score || "Not available"}
                </p>

                <button
                    class="delete-match"
                    data-id="${matchDoc.id}">

                    🗑️ Delete

                </button>

            `;


            list.appendChild(card);

        });


        document
            .querySelectorAll(".delete-match")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => deleteMatch(button.dataset.id)
                );

            });


    } catch (error) {

        console.error(error);

        list.innerHTML =
            "<p>Unable to load matches.</p>";

    }

}


// ===============================
// DELETE MATCH
// ===============================

async function deleteMatch(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this match?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "matches", id)
        );


        alert("Match deleted.");

        loadMatches();


    } catch (error) {

        console.error(error);

        alert(
            "Could not delete match: " +
            error.message
        );

    }

}


// ===============================
// LOAD COUNTDOWN
// ===============================

async function loadCountdown() {

    try {

        const countdownDoc =
            await getDoc(
                doc(db, "siteSettings", "countdown")
            );


        if (!countdownDoc.exists()) {
            return;
        }


        const data =
            countdownDoc.data();


        document.getElementById("homeTeam").value =
            data.homeTeam || "";


        document.getElementById("awayTeam").value =
            data.awayTeam || "";


        document.getElementById("matchDate").value =
            data.matchDate || "";


    } catch (error) {

        console.error(
            "Could not load countdown:",
            error
        );

    }

}


// ===============================
// LOGOUT
// ===============================

document
    .getElementById("logoutBtn")
    .addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

       
