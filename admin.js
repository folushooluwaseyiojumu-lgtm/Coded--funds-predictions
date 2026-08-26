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
                        ${escapeHTML(
                            data.home || ""
                        )}
                        vs
                        ${escapeHTML(
                            data.away || ""
                        )}
                    </h3>

                    <p>
                        Status:
                        ${escapeHTML(
                            data.status || ""
                        )}
                    </p>

                    <p>
                        Time:
                        ${escapeHTML(
                            data.time || "Not set"
                        )}
                    </p>

                    <p>
                        Score:
                        ${escapeHTML(
                            data.score ||
                            "Not available"
                        )}
                    </p>

                    <button
                        class="delete-match"
                        data-id="${matchDoc.id}">

                        🗑️ Delete

                    </button>

                `;


                list.appendChild(card);

            }
        );


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
