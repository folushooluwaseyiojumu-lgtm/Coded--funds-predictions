import { db } from "./firebase.js";

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


// ==========================================
// ADMIN.JS
// No user login required
// ==========================================

console.log("✅ admin.js loaded successfully");


// ==========================================
// HELPER
// ==========================================

function getElement(id) {
    return document.getElementById(id);
}


// ==========================================
// SAVE COUNTDOWN
// ==========================================

getElement("saveCountdownBtn").addEventListener("click", async () => {

    const homeTeam = getElement("homeTeam").value.trim();
    const awayTeam = getElement("awayTeam").value.trim();
    const matchDate = getElement("matchDate").value;

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

        alert("✅ Countdown saved successfully!");

    } catch (error) {

        console.error("Countdown error:", error);

        alert(
            "❌ Countdown could not be saved.\n\n" +
            error.message
        );

    }

});


// ==========================================
// LOAD COUNTDOWN
// ==========================================

async function loadCountdown() {

    try {

        const countdownDoc = await getDoc(
            doc(db, "siteSettings", "countdown")
        );

        if (!countdownDoc.exists()) {
            console.log("No countdown saved yet.");
            return;
        }

        const data = countdownDoc.data();

        getElement("homeTeam").value =
            data.homeTeam || "";

        getElement("awayTeam").value =
            data.awayTeam || "";

        getElement("matchDate").value =
            data.matchDate || "";

    } catch (error) {

        console.error("Load countdown error:", error);

    }

}


// ==========================================
// ADD MATCH
// ==========================================

getElement("addMatchBtn").addEventListener("click", async () => {

    const home =
        getElement("matchHome").value.trim();

    const away =
        getElement("matchAway").value.trim();

    const status =
        getElement("matchStatus").value;

    const time =
        getElement("matchTime").value.trim();

    const score =
        getElement("matchScore").value.trim();


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


        alert("✅ Match added successfully!");


        getElement("matchHome").value = "";
        getElement("matchAway").value = "";
        getElement("matchTime").value = "";
        getElement("matchScore").value = "";


        loadMatches();


    } catch (error) {

        console.error("Add match error:", error);

        alert(
            "❌ Could not add match.\n\n" +
            error.message
        );

    }

});


// ==========================================
// LOAD MATCHES
// ==========================================

async function loadMatches() {

    const list = getElement("matchesList");

    try {

        const snapshot = await getDocs(
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
                    ⚽ ${data.home} vs ${data.away}
                </h3>

                <p>
                    Status: ${data.status || "upcoming"}
                </p>

                <p>
                    Time: ${data.time || "Not set"}
                </p>

                <p>
                    Score: ${data.score || "Not available"}
                </p>

                <button
                    type="button"
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
                    () => {

                        deleteMatch(
                            button.dataset.id
                        );

                    }
                );

            });


    } catch (error) {

        console.error("Load matches error:", error);

        list.innerHTML =
            "<p>❌ Unable to load matches.</p>";

    }

}


// ==========================================
// DELETE MATCH
// ==========================================

async function deleteMatch(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this match?"
    );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "matches", id)
        );


        alert("✅ Match deleted successfully!");

        loadMatches();


    } catch (error) {

        console.error("Delete match error:", error);

        alert(
            "❌ Could not delete match.\n\n" +
            error.message
        );

    }

}


// ==========================================
// ADD RESULT
// ==========================================

getElement("addResultBtn").addEventListener("click", async () => {

    const home =
        getElement("resultHome").value.trim();

    const away =
        getElement("resultAway").value.trim();

    const score =
        getElement("resultScore").value.trim();

    const info =
        getElement("resultInfo").value.trim();


    if (!home || !away || !score) {

        alert(
            "Please enter the home team, away team and final score."
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


        alert("✅ Match result added successfully!");


        getElement("resultHome").value = "";
        getElement("resultAway").value = "";
        getElement("resultScore").value = "";
        getElement("resultInfo").value = "";


    } catch (error) {

        console.error("Add result error:", error);

        alert(
            "❌ Could not add result.\n\n" +
            error.message
        );

    }

});


// ==========================================
// FREE TIPS
// ==========================================

let editingTipId = null;


// ==========================================
// ADD / UPDATE FREE TIP
// ==========================================

getElement("addTipBtn").addEventListener("click", async () => {

    const home =
        getElement("tipHome").value.trim();

    const away =
        getElement("tipAway").value.trim();

    const prediction =
        getElement("tipPrediction").value.trim();

    const odds =
        getElement("tipOdds").value.trim();

    const date =
        getElement("tipDate").value;

    const status =
        getElement("tipStatus").value;


    if (
        !home ||
        !away ||
        !prediction ||
        !odds ||
        !date
    ) {

        alert(
            "Please fill in all free tip fields."
        );

        return;
    }


    try {

        // ==================================
        // UPDATE TIP
        // ==================================

        if (editingTipId) {

            await setDoc(
                doc(db, "freeTips", editingTipId),
                {
                    home: home,
                    away: away,
                    prediction: prediction,
                    odds: odds,
                    date: date,
                    status: status,
                    updatedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );


            alert(
                "✅ Free tip updated successfully!"
            );


            editingTipId = null;


            getElement("addTipBtn").textContent =
                "➕ Publish Free Tip";

        }


        // ==================================
        // CREATE TIP
        // ==================================

        else {

            await addDoc(
                collection(db, "freeTips"),
                {
                    home: home,
                    away: away,
                    prediction: prediction,
                    odds: odds,
                    date: date,
                    status: status,
                    createdAt: serverTimestamp()
                }
            );


            alert(
                "✅ Free tip published successfully!"
            );

        }


        clearTipForm();

        loadFreeTips();


    } catch (error) {

        console.error(
            "Free tip error:",
            error
        );

        alert(
            "❌ Could not save free tip.\n\n" +
            error.message
        );

    }

});


// ==========================================
// LOAD FREE TIPS
// ==========================================

async function loadFreeTips() {

    const list =
        getElement("tipsList");


    try {

        const snapshot =
            await getDocs(
                collection(db, "freeTips")
            );


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML =
                "<p>No free tips published yet.</p>";

            return;
        }


        snapshot.forEach((tipDoc) => {

            const data =
                tipDoc.data();


            const card =
                document.createElement("div");


            card.className =
                "match-card";


            card.innerHTML = `

                <h3>
                    ⚽ ${data.home} vs ${data.away}
                </h3>

                <p>
                    🎯 Prediction:
                    ${data.prediction}
                </p>

                <p>
                    📈 Odds:
                    ${data.odds}
                </p>

                <p>
                    📅 Date:
                    ${data.date}
                </p>

                <p>
                    📊 Status:
                    ${data.status}
                </p>

                <button
                    type="button"
                    class="edit-tip"
                    data-id="${tipDoc.id}">
                    ✏️ Edit
                </button>

                <button
                    type="button"
                    class="delete-tip"
                    data-id="${tipDoc.id}">
                    🗑️ Delete
                </button>

            `;


            list.appendChild(card);

        });


        // ==================================
        // EDIT BUTTONS
        // ==================================

        document
            .querySelectorAll(".edit-tip")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editFreeTip(
                            button.dataset.id
                        );

                    }
                );

            });


        // ==================================
        // DELETE BUTTONS
        // ==================================

        document
            .querySelectorAll(".delete-tip")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteFreeTip(
                            button.dataset.id
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Load free tips error:",
            error
        );

        list.innerHTML =
            "<p>❌ Unable to load free tips.</p>";

    }

}


// ==========================================
// EDIT FREE TIP
// ==========================================

async function editFreeTip(id) {

    try {

        const tipDoc =
            await getDoc(
                doc(db, "freeTips", id)
            );


        if (!tipDoc.exists()) {

            alert(
                "This free tip no longer exists."
            );

            return;
        }


        const data =
            tipDoc.data();


        getElement("tipHome").value =
            data.home || "";

        getElement("tipAway").value =
            data.away || "";

        getElement("tipPrediction").value =
            data.prediction || "";

        getElement("tipOdds").value =
            data.odds || "";

        getElement("tipDate").value =
            data.date || "";

        getElement("tipStatus").value =
            data.status || "pending";


        editingTipId = id;


        getElement("addTipBtn").textContent =
            "💾 Update Free Tip";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit tip error:",
            error
        );

        alert(
            "❌ Could not load this free tip."
        );

    }

}


// ==========================================
// DELETE FREE TIP
// ==========================================

async function deleteFreeTip(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this free tip?"
    );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "freeTips", id)
        );


        alert(
            "✅ Free tip deleted successfully!"
        );


        loadFreeTips();


    } catch (error) {

        console.error(
            "Delete tip error:",
            error
        );

        alert(
            "❌ Could not delete free tip.\n\n" +
            error.message
        );

    }

}


// ==========================================
// CLEAR FREE TIP FORM
// ==========================================

function clearTipForm() {

    getElement("tipHome").value = "";
    getElement("tipAway").value = "";
    getElement("tipPrediction").value = "";
    getElement("tipOdds").value = "";
    getElement("tipDate").value = "";
    getElement("tipStatus").value = "pending";

}


// ==========================================
// START ADMIN PAGE
// ==========================================

loadCountdown();
loadMatches();
loadFreeTips();


console.log("✅ Admin dashboard is ready.");
