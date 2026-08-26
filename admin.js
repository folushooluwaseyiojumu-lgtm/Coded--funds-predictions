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


// ==========================================
// ADMIN
// ==========================================

const ADMIN_EMAIL = "folushooluwaseyiojumu@gmail.com";


// ==========================================
// EDITING IDs
// ==========================================

let editingMatchId = null;
let editingTipId = null;


// ==========================================
// WAIT FOR PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ Admin JavaScript loaded");

    // Buttons
    const saveCountdownBtn =
        document.getElementById("saveCountdownBtn");

    const addMatchBtn =
        document.getElementById("addMatchBtn");

    const addResultBtn =
        document.getElementById("addResultBtn");

    const addTipBtn =
        document.getElementById("addTipBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // ==========================================
    // CHECK BUTTONS
    // ==========================================

    console.log("Countdown button:", saveCountdownBtn);
    console.log("Match button:", addMatchBtn);
    console.log("Result button:", addResultBtn);
    console.log("Tip button:", addTipBtn);
    console.log("Logout button:", logoutBtn);


    // ==========================================
    // COUNTDOWN BUTTON
    // ==========================================

    if (saveCountdownBtn) {

        saveCountdownBtn.addEventListener(
            "click",
            saveCountdown
        );

    }


    // ==========================================
    // MATCH BUTTON
    // ==========================================

    if (addMatchBtn) {

        addMatchBtn.addEventListener(
            "click",
            saveMatch
        );

    }


    // ==========================================
    // RESULT BUTTON
    // ==========================================

    if (addResultBtn) {

        addResultBtn.addEventListener(
            "click",
            addResult
        );

    }


    // ==========================================
    // FREE TIP BUTTON
    // ==========================================

    if (addTipBtn) {

        addTipBtn.addEventListener(
            "click",
            saveFreeTip
        );

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logoutAdmin
        );

    }


    // ==========================================
    // LOAD DATA
    // ==========================================

    loadCountdown();
    loadMatches();
    loadFreeTips();

});


// ==========================================
// AUTH CHECK
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        console.log("No admin logged in.");

        window.location.href = "login.html";

        return;
    }


    if (user.email !== ADMIN_EMAIL) {

        alert("Access denied. Admin only.");

        window.location.href = "index.html";

        return;
    }


    console.log(
        "✅ Admin logged in:",
        user.email
    );

});


// ==========================================
// SAVE COUNTDOWN
// ==========================================

async function saveCountdown() {

    const homeTeam =
        document.getElementById("homeTeam").value.trim();

    const awayTeam =
        document.getElementById("awayTeam").value.trim();

    const matchDate =
        document.getElementById("matchDate").value;


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
            "❌ Could not save countdown:\n" +
            error.message
        );

    }

}


// ==========================================
// SAVE / UPDATE MATCH
// ==========================================

async function saveMatch() {

    const home =
        document.getElementById(
            "matchHome"
        ).value.trim();

    const away =
        document.getElementById(
            "matchAway"
        ).value.trim();

    const status =
        document.getElementById(
            "matchStatus"
        ).value;

    const time =
        document.getElementById(
            "matchTime"
        ).value.trim();

    const score =
        document.getElementById(
            "matchScore"
        ).value.trim();


    if (!home || !away) {

        alert(
            "Please enter both teams."
        );

        return;
    }


    try {

        // ======================================
        // UPDATE
        // ======================================

        if (editingMatchId) {

            await setDoc(
                doc(
                    db,
                    "matches",
                    editingMatchId
                ),
                {
                    home: home,
                    away: away,
                    status: status,
                    time: time,
                    score: score,
                    updatedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );


            alert(
                "✅ Match updated successfully!"
            );

        }


        // ======================================
        // CREATE
        // ======================================

        else {

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

        }


        editingMatchId = null;


        clearMatchForm();


        document.getElementById(
            "addMatchBtn"
        ).textContent =
            "➕ Add Match";


        loadMatches();


    } catch (error) {

        console.error(
            "Match error:",
            error
        );

        alert(
            "❌ Could not save match:\n" +
            error.message
        );

    }

}


// ==========================================
// CLEAR MATCH FORM
// ==========================================

function clearMatchForm() {

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

}


// ==========================================
// LOAD MATCHES
// ==========================================

async function loadMatches() {

    const list =
        document.getElementById(
            "matchesList"
        );


    if (!list) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "matches"
                )
            );


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML =
                "<p>No matches added yet.</p>";

            return;
        }


        snapshot.forEach(
            (matchDoc) => {

                const data =
                    matchDoc.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "match-card";


                card.innerHTML = `

                    <h3>
                        ${data.home}
                        vs
                        ${data.away}
                    </h3>

                    <p>
                        Status:
                        ${data.status || "Not set"}
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

            }
        );


        // EDIT

        document
            .querySelectorAll(
                ".edit-match"
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            editMatch(
                                button.dataset.id
                            );

                        }
                    );

                }
            );


        // DELETE

        document
            .querySelectorAll(
                ".delete-match"
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            deleteMatch(
                                button.dataset.id
                            );

                        }
                    );

                }
            );


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
// EDIT MATCH
// ==========================================

async function editMatch(id) {

    try {

        const matchDoc =
            await getDoc(
                doc(
                    db,
                    "matches",
                    id
                )
            );


        if (!matchDoc.exists()) {

            alert(
                "This match no longer exists."
            );

            return;
        }


        const data =
            matchDoc.data();


        document.getElementById(
            "matchHome"
        ).value =
            data.home || "";


        document.getElementById(
            "matchAway"
        ).value =
            data.away || "";


        document.getElementById(
            "matchStatus"
        ).value =
            data.status || "upcoming";


        document.getElementById(
            "matchTime"
        ).value =
            data.time || "";


        document.getElementById(
            "matchScore"
        ).value =
            data.score || "";


        editingMatchId = id;


        document.getElementById(
            "addMatchBtn"
        ).textContent =
            "💾 Update Match";


        document.getElementById(
            "matchHome"
        ).scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    } catch (error) {

        console.error(
            "Edit match error:",
            error
        );

        alert(
            "❌ Could not load match:\n" +
            error.message
        );

    }

}


// ==========================================
// DELETE MATCH
// ==========================================

async function deleteMatch(id) {

    if (
        !confirm(
            "Are you sure you want to delete this match?"
        )
    ) {

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
            "❌ Could not delete match:\n" +
            error.message
        );

    }

}


// ==========================================
// ADD RESULT
// ==========================================

async function addResult() {

    const home =
        document.getElementById(
            "resultHome"
        ).value.trim();

    const away =
        document.getElementById(
            "resultAway"
        ).value.trim();

    const score =
        document.getElementById(
            "resultScore"
        ).value.trim();

    const info =
        document.getElementById(
            "resultInfo"
        ).value.trim();


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
            "Result error:",
            error
        );

        alert(
            "❌ Could not add result:\n" +
            error.message
        );

    }

}


// ==========================================
// SAVE / UPDATE FREE TIP
// ==========================================

async function saveFreeTip() {

    const home =
        document.getElementById(
            "tipHome"
        ).value.trim();

    const away =
        document.getElementById(
            "tipAway"
        ).value.trim();

    const prediction =
        document.getElementById(
            "tipPrediction"
        ).value.trim();

    const odds =
        document.getElementById(
            "tipOdds"
        ).value.trim();

    const date =
        document.getElementById(
            "tipDate"
        ).value;

    const status =
        document.getElementById(
            "tipStatus"
        ).value;


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

        // UPDATE

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

        }


        // CREATE

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


        editingTipId = null;


        clearTipForm();


        document.getElementById(
            "addTipBtn"
        ).textContent =
            "➕ Publish Free Tip";


        loadFreeTips();


    } catch (error) {

        console.error(
            "Free tip error:",
            error
        );

        alert(
            "❌ Could not save free tip:\n" +
            error.message
        );

    }

}


// ==========================================
// LOAD FREE TIPS
// ==========================================

async function loadFreeTips() {

    const list =
        document.getElementById(
            "tipsList"
        );


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


        snapshot.forEach(
            (tipDoc) => {

                const data =
                    tipDoc.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "match-card";


                card.innerHTML = `

                    <h3>
                        ${data.home}
                        vs
                        ${data.away}
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
                        Status:
                        ${data.status}
                    </p>

                    <button
                        class="edit-tip"
                        data-id="${tipDoc.id}">

                        ✏️ Edit

                    </button>

                    <button
                        class="delete-tip"
                        data-id="${tipDoc.id}">

                        🗑️ Delete

                    </button>

                `;


                list.appendChild(card);

            }
        );


        // EDIT TIP

        document
            .querySelectorAll(
                ".edit-tip"
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            editFreeTip(
                                button.dataset.id
                            );

                    );

                }
            );


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
            "Edit tip error:",
            error
        );

        alert(
            "❌ Could not load free tip:\n" +
            error.message
        );

    }

}


// ==========================================
// DELETE FREE TIP
// ==========================================

async function deleteFreeTip(id) {

    if (
        !confirm(
            "Are you sure you want to delete this free tip?"
        )
    ) {

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
            "Delete tip error:",
            error
        );

        alert(
            "❌ Could not delete free tip:\n" +
            error.message
        );

    }

}
// ==========================================
// CLEAR FREE TIP FORM
// ==========================================

function clearTipForm() {

    document.getElementById(
        "tipHome"
    ).value = "";

    document.getElementById(
        "tipAway"
    ).value = "";

    document.getElementById(
        "tipPrediction"
    ).value = "";

    document.getElementById(
        "tipOdds"
    ).value = "";

    document.getElementById(
        "tipDate"
    ).value = "";

    document.getElementById(
        "tipStatus"
    ).value = "pending";

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


        document.getElementById(
            "homeTeam"
        ).value =
            data.homeTeam || "";


        document.getElementById(
            "awayTeam"
        ).value =
            data.awayTeam || "";


        document.getElementById(
            "matchDate"
        ).value =
            data.matchDate || "";


    } catch (error) {

        console.error(
            "Load countdown error:",
            error
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

async function logoutAdmin() {

    try {

        await signOut(auth);

        window.location.href =
            "login.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "❌ Could not logout:\n" +
            error.message
        );

    }

}

              
