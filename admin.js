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
// PAGE READY
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadMatches();
    loadCountdown();

    // Only attach listeners when the buttons exist
    const saveCountdownBtn =
        document.getElementById("saveCountdownBtn");

    const addMatchBtn =
        document.getElementById("addMatchBtn");

    const addResultBtn =
        document.getElementById("addResultBtn");


    if (saveCountdownBtn) {
        saveCountdownBtn.addEventListener(
            "click",
            saveCountdown
        );
    }


    if (addMatchBtn) {
        addMatchBtn.addEventListener(
            "click",
            addMatch
        );
    }


    if (addResultBtn) {
        addResultBtn.addEventListener(
            "click",
            addResult
        );
    }

});


// ==========================================
// SAVE COUNTDOWN
// ==========================================

async function saveCountdown() {

    const homeTeam =
        document.getElementById("homeTeam")
            .value
            .trim();

    const awayTeam =
        document.getElementById("awayTeam")
            .value
            .trim();

    const matchDate =
        document.getElementById("matchDate")
            .value;


    if (!homeTeam || !awayTeam || !matchDate) {

        alert(
            "Please fill in all countdown fields."
        );

        return;
    }


    try {

        await setDoc(
            doc(
                db,
                "siteSettings",
                "countdown"
            ),
            {
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                matchDate: matchDate,
                updatedAt: serverTimestamp()
            }
        );


        alert(
            "✅ Countdown saved successfully!"
        );


    } catch (error) {

        console.error(
            "Countdown error:",
            error
        );

        alert(
            "❌ Could not save countdown:\n\n" +
            error.message
        );

    }

}


// ==========================================
// LOAD COUNTDOWN
// ==========================================

async function loadCountdown() {

    try {

        const countdownDoc =
            await getDoc(
                doc(
                    db,
                    "siteSettings",
                    "countdown"
                )
            );


        if (!countdownDoc.exists()) {

            console.log(
                "No countdown saved yet."
            );

            return;
        }


        const data =
            countdownDoc.data();


        const homeTeam =
            document.getElementById("homeTeam");

        const awayTeam =
            document.getElementById("awayTeam");

        const matchDate =
            document.getElementById("matchDate");


        if (homeTeam) {
            homeTeam.value =
                data.homeTeam || "";
        }


        if (awayTeam) {
            awayTeam.value =
                data.awayTeam || "";
        }


        if (matchDate) {
            matchDate.value =
                data.matchDate || "";
        }


    } catch (error) {

        console.error(
            "Could not load countdown:",
            error
        );

    }

}


// ==========================================
// ADD MATCH
// ==========================================

async function addMatch() {

    const home =
        document.getElementById("matchHome")
            .value
            .trim();

    const away =
        document.getElementById("matchAway")
            .value
            .trim();

    const status =
        document.getElementById("matchStatus")
            .value;

    const time =
        document.getElementById("matchTime")
            .value
            .trim();

    const score =
        document.getElementById("matchScore")
            .value
            .trim();


    if (!home || !away) {

        alert(
            "Please enter both teams."
        );

        return;
    }


    try {

        await addDoc(
            collection(
                db,
                "matches"
            ),
            {
                home: home,
                away: away,
                status: status,
                time: time,
                score: score,
                createdAt:
                    serverTimestamp()
            }
        );


        alert(
            "✅ Match added successfully!"
        );


        document.getElementById(
            "matchHome"
        ).value = "";

        document.getElementById(
            "matchAway"
        ).value = "";

        document.getElementById(
            "matchTime"
        ).value = "";

        document.getElementById(
            "matchScore"
        ).value = "";


        loadMatches();


    } catch (error) {

        console.error(
            "Add match error:",
            error
        );

        alert(
            "❌ Could not add match:\n\n" +
            error.message
        );

    }

}


async function loadMatches() {

    const list = document.getElementById("matchesList");

    if (!list) return;

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

            const card = document.createElement("div");

            card.className = "match-card";

            card.innerHTML = `

                <h3>
                    ${data.home || ""} vs ${data.away || ""}
                </h3>

                <p>
                    Status:
                    ${data.status || "upcoming"}
                </p>

                <p>
                    Time:
                    ${data.time || "Not set"}
                </p>

                <p>
                    Score:
                    ${data.score || "Not available"}
                </p>

                <button
                    class="edit-match"
                    data-id="${matchDoc.id}">
                    ✏️ Edit
                </button>

                <button
                    class="delete-match"
                    data-id="${matchDoc.id}">
                    🗑️ Delete
                </button>

            `;

            list.appendChild(card);

        });


        // EDIT BUTTONS

        document
            .querySelectorAll(".edit-match")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => editMatch(button.dataset.id)
                );

            });


        // DELETE BUTTONS

        document
            .querySelectorAll(".delete-match")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => deleteMatch(button.dataset.id)
                );

            });


    } catch (error) {

        console.error(
            "Load matches error:",
            error
        );

        list.innerHTML =
            "<p>❌ Unable to load matches.</p>";

    }

}


// ==========================================
// DELETE MATCH
// ==========================================

async function deleteMatch(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this match?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "matches",
                id
            )
        );


        alert(
            "✅ Match deleted."
        );


        loadMatches();


    } catch (error) {

        console.error(
            "Delete match error:",
            error
        );

        alert(
            "❌ Could not delete match:\n\n" +
            error.message
        );

    }

}


// ==========================================
// ADD MATCH RESULT
// ==========================================

async function addResult() {

    const home =
        document.getElementById("resultHome")
            .value
            .trim();

    const away =
        document.getElementById("resultAway")
            .value
            .trim();

    const score =
        document.getElementById("resultScore")
            .value
            .trim();

    const info =
        document.getElementById("resultInfo")
            .value
            .trim();


    if (!home || !away || !score) {

        alert(
            "Please enter the teams and final score."
        );

        return;
    }


    try {

        await addDoc(
            collection(
                db,
                "results"
            ),
            {
                home: home,
                away: away,
                score: score,
                info: info,
                createdAt:
                    serverTimestamp()
            }
        );


        alert(
            "✅ Result added successfully!"
        );


        document.getElementById(
            "resultHome"
        ).value = "";

        document.getElementById(
            "resultAway"
        ).value = "";

        document.getElementById(
            "resultScore"
        ).value = "";

        document.getElementById(
            "resultInfo"
        ).value = "";


    } catch (error) {

        console.error(
            "Add result error:",
            error
        );

        alert(
            "❌ Could not add result:\n\n" +
            error.message
        );

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

            }
// ==========================================
// FREE TIPS MANAGER
// ==========================================

let editingTipId = null;


// ==========================================
// SAVE / UPDATE FREE TIP
// ==========================================

async function saveFreeTip() {

    const home =
        document.getElementById("tipHome")
            .value
            .trim();

    const away =
        document.getElementById("tipAway")
            .value
            .trim();

    const prediction =
        document.getElementById("tipPrediction")
            .value
            .trim();

    const odds =
        document.getElementById("tipOdds")
            .value
            .trim();

    const date =
        document.getElementById("tipDate")
            .value;

    const status =
        document.getElementById("tipStatus")
            .value;


    if (!home || !away || !prediction || !odds || !date) {

        alert(
            "Please fill in all free tip fields."
        );

        return;
    }


    try {

        // ==============================
        // UPDATE EXISTING TIP
        // ==============================

        if (editingTipId) {

            await setDoc(
                doc(
                    db,
                    "freeTips",
                    editingTipId
                ),
                {
                    home: home,
                    away: away,
                    prediction: prediction,
                    odds: odds,
                    date: date,
                    status: status,
                    updatedAt:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );


            alert(
                "✅ Free tip updated successfully!"
            );


            editingTipId = null;


            document.getElementById(
                "addTipBtn"
            ).textContent =
                "➕ Publish Free Tip";

        }


        // ==============================
        // CREATE NEW TIP
        // ==============================

        else {

            await addDoc(
                collection(
                    db,
                    "freeTips"
                ),
                {
                    home: home,
                    away: away,
                    prediction: prediction,
                    odds: odds,
                    date: date,
                    status: status,
                    createdAt:
                        serverTimestamp()
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
            "❌ Could not save free tip:\n\n" +
            error.message
        );

    }

}


// ==========================================
// LOAD FREE TIPS
// ==========================================

async function loadFreeTips() {

    const list =
        document.getElementById("tipsList");


    if (!list) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "freeTips"
                )
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
                    ${escapeHTML(data.home || "")}
                    vs
                    ${escapeHTML(data.away || "")}
                </h3>

                <p>
                    🎯 Prediction:
                    ${escapeHTML(data.prediction || "")}
                </p>

                <p>
                    📈 Odds:
                    ${escapeHTML(data.odds || "")}
                </p>

                <p>
                    📅 Date:
                    ${escapeHTML(data.date || "")}
                </p>

                <p>
                    Status:
                    ${escapeHTML(data.status || "pending")}
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


        // ==============================
        // EDIT BUTTONS
        // ==============================

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


        // ==============================
        // DELETE BUTTONS
        // ==============================

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
                doc(
                    db,
                    "freeTips",
                    id
                )
            );


        if (!tipDoc.exists()) {

            alert(
                "This free tip no longer exists."
            );

            return;
        }


        const data =
            tipDoc.data();


        document.getElementById(
            "tipHome"
        ).value =
            data.home || "";


        document.getElementById(
            "tipAway"
        ).value =
            data.away || "";


        document.getElementById(
            "tipPrediction"
        ).value =
            data.prediction || "";


        document.getElementById(
            "tipOdds"
        ).value =
            data.odds || "";


        document.getElementById(
            "tipDate"
        ).value =
            data.date || "";


        document.getElementById(
            "tipStatus"
        ).value =
            data.status || "pending";


        editingTipId = id;


        document.getElementById(
            "addTipBtn"
        ).textContent =
            "💾 Update Free Tip";


        document.getElementById(
            "tipHome"
        ).scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    } catch (error) {

        console.error(
            "Edit free tip error:",
            error
        );

        alert(
            "❌ Could not load free tip:\n\n" +
            error.message
        );

    }

}


// ==========================================
// DELETE FREE TIP
// ==========================================

async function deleteFreeTip(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this free tip?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "freeTips",
                id
            )
        );


        alert(
            "✅ Free tip deleted."
        );


        loadFreeTips();


    } catch (error) {

        console.error(
            "Delete free tip error:",
            error
        );

        alert(
            "❌ Could not delete free tip:\n\n" +
            error.message
        );

    }

}


// ==========================================
// CLEAR FREE TIP FORM
// ==========================================

function clearTipForm() {

    const tipHome =
        document.getElementById("tipHome");

    const tipAway =
        document.getElementById("tipAway");

    const tipPrediction =
        document.getElementById("tipPrediction");

    const tipOdds =
        document.getElementById("tipOdds");

    const tipDate =
        document.getElementById("tipDate");

    const tipStatus =
        document.getElementById("tipStatus");


    if (tipHome) {
        tipHome.value = "";
    }

    if (tipAway) {
        tipAway.value = "";
    }

    if (tipPrediction) {
        tipPrediction.value = "";
    }

    if (tipOdds) {
        tipOdds.value = "";
    }

    if (tipDate) {
        tipDate.value = "";
    }

    if (tipStatus) {
        tipStatus.value = "pending";
    }

    }
