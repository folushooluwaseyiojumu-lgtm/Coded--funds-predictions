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
// YOUR ADMIN EMAIL
// ==========================================

const ADMIN_EMAIL = "folushooluwaseyiojumu@gmail.com";


// ==========================================
// CHECK ADMIN LOGIN
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    // Make sure only your account can use Admin
    if (
        !user.email ||
        user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
    ) {

        alert("Access denied. Admin account required.");

        await signOut(auth);

        window.location.href = "index.html";

        return;
    }


    console.log("Admin logged in:", user.email);


    // Load existing data
    await loadMatches();

    await loadCountdown();

});


// ==========================================
// SAVE COUNTDOWN
// ==========================================

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


            alert("✅ Countdown saved successfully!");

            console.log("Countdown saved.");

        } catch (error) {

            console.error("Countdown error:", error);

            alert(
                "❌ Could not save countdown.\n\n" +
                error.message
            );

        }

    });


// ==========================================
// ADD MATCH
// ==========================================

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


            alert("✅ Match added successfully!");


            document.getElementById("matchHome").value = "";
            document.getElementById("matchAway").value = "";
            document.getElementById("matchTime").value = "";
            document.getElementById("matchScore").value = "";


            await loadMatches();


        } catch (error) {

            console.error("Add match error:", error);

            alert(
                "❌ Could not add match.\n\n" +
                error.message
            );

        }

    });


// ==========================================
// RECENT RESULTS MANAGER
// ==========================================

let editingResultId = null;


// ==========================================
// ADD / UPDATE RESULT
// ==========================================

document
    .getElementById("addResultBtn")
    .addEventListener("click", async () => {

        const home =
            document.getElementById("resultHome")
                .value.trim();

        const away =
            document.getElementById("resultAway")
                .value.trim();

        const score =
            document.getElementById("resultScore")
                .value.trim();

        const info =
            document.getElementById("resultInfo")
                .value.trim();


        if (!home || !away || !score) {

            alert(
                "Please enter the teams and final score."
            );

            return;
        }


        try {

            // UPDATE EXISTING RESULT
            if (editingResultId) {

                await setDoc(
                    doc(
                        db,
                        "results",
                        editingResultId
                    ),
                    {
                        home: home,
                        away: away,
                        score: score,
                        info: info,
                        updatedAt:
                            serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );


                alert(
                    "✅ Result updated successfully!"
                );


                editingResultId = null;


                document.getElementById(
                    "addResultBtn"
                ).textContent =
                    "🏆 Add Result";

            }

            // ADD NEW RESULT
            else {

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

            }


            clearResultForm();

            loadResults();


        } catch (error) {

            console.error(
                "Result error:",
                error
            );

            alert(
                "❌ Could not save result:\n" +
                error.message
            );

        }

    });
<hr>

<h3>
    📋 Current Results
</h3>

<div id="resultsList">

    <p>
        Loading results...
    </p>

</div>

// ==========================================
// LOAD RESULTS
// ==========================================

async function loadResults() {

    const list =
        document.getElementById(
            "resultsList"
        );


    if (!list) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "results"
                )
            );


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML =
                "<p>No results added yet.</p>";

            return;
        }


        snapshot.forEach((resultDoc) => {

            const data =
                resultDoc.data();


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
                    🏆 Score:
                    ${data.score}
                </p>

                <p>
                    ℹ️ ${data.info || ""}
                </p>

                <button
                    class="edit-result"
                    data-id="${resultDoc.id}">

                    ✏️ Edit

                </button>

                <button
                    class="delete-result"
                    data-id="${resultDoc.id}">

                    🗑️ Delete

                </button>

            `;


            list.appendChild(card);

        });


        // EDIT BUTTONS

        document
            .querySelectorAll(
                ".edit-result"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editResult(
                            button.dataset.id
                        );

                    }
                );

            });


        // DELETE BUTTONS

        document
            .querySelectorAll(
                ".delete-result"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteResult(
                            button.dataset.id
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Load results error:",
            error
        );

        list.innerHTML =
            "<p>Unable to load results.</p>";

    }

}


// ==========================================
// EDIT RESULT
// ==========================================

async function editResult(id) {

    try {

        const resultDoc =
            await getDoc(
                doc(
                    db,
                    "results",
                    id
                )
            );


        if (!resultDoc.exists()) {

            alert(
                "This result no longer exists."
            );

            return;
        }


        const data =
            resultDoc.data();


        document.getElementById(
            "resultHome"
        ).value =
            data.home || "";


        document.getElementById(
            "resultAway"
        ).value =
            data.away || "";


        document.getElementById(
            "resultScore"
        ).value =
            data.score || "";


        document.getElementById(
            "resultInfo"
        ).value =
            data.info || "";


        editingResultId = id;


        document.getElementById(
            "addResultBtn"
        ).textContent =
            "💾 Update Result";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit result error:",
            error
        );

        alert(
            "❌ Could not load this result."
        );

    }

}


// ==========================================
// DELETE RESULT
// ==========================================

async function deleteResult(id) {

    if (
        !confirm(
            "Are you sure you want to delete this result?"
        )
    ) {

        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "results",
                id
            )
        );


        alert(
            "✅ Result deleted."
        );


        loadResults();


    } catch (error) {

        console.error(
            "Delete result error:",
            error
        );

        alert(
            "❌ Could not delete result:\n" +
            error.message
        );

    }

}


// ==========================================
// CLEAR RESULT FORM
// ==========================================

function clearResultForm() {

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

}


// ==========================================
// LOAD RESULTS WHEN ADMIN OPENS
// ==========================================

loadResults();
// ==========================================
// LOAD MATCHES
// ==========================================

async function loadMatches() {

    const list =
        document.getElementById("matchesList");


    if (!list) {

        console.error("matchesList not found.");

        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(db, "matches")
            );


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML =
                "<p>📭 No matches added yet.</p>";

            return;
        }


        snapshot.forEach((matchDoc) => {

            const data =
                matchDoc.data();


            const card =
                document.createElement("div");

            card.className =
                "match-card";


            card.innerHTML = `

                <h3>
                    ⚽ ${data.home || ""} vs ${data.away || ""}
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
                    async () => {

                        await deleteMatch(
                            button.dataset.id
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Load matches error:",
            error
        );


        list.innerHTML =
            "<p>❌ Unable to load matches.</p>";


        alert(
            "Could not load matches.\n\n" +
            error.message
        );

    }

}


// ==========================================
// DELETE MATCH
// ==========================================

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


        alert("✅ Match deleted successfully.");


        await loadMatches();


    } catch (error) {

        console.error(
            "Delete match error:",
            error
        );


        alert(
            "❌ Could not delete match.\n\n" +
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
                doc(db, "siteSettings", "countdown")
            );


        if (!countdownDoc.exists()) {

            console.log(
                "No countdown has been saved yet."
            );

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
            "Load countdown error:",
            error
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener("click", async () => {

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
                "Could not logout.\n\n" +
                error.message
            );

        }

    });
// ==========================================
// FREE TIPS MANAGER
// ==========================================

let editingTipId = null;


// ==========================================
// PUBLISH / UPDATE FREE TIP
// ==========================================

document
    .getElementById("addTipBtn")
    .addEventListener("click", async () => {

        const home =
            document.getElementById("tipHome").value.trim();

        const away =
            document.getElementById("tipAway").value.trim();

        const prediction =
            document.getElementById("tipPrediction").value.trim();

        const odds =
            document.getElementById("tipOdds").value.trim();

        const date =
            document.getElementById("tipDate").value;

        const status =
            document.getElementById("tipStatus").value;


        if (
            !home ||
            !away ||
            !prediction ||
            !odds ||
            !date
        ) {

            alert("Please fill in all free tip fields.");

            return;
        }


        try {

            // ==============================
            // UPDATE EXISTING TIP
            // ==============================

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


                alert("✅ Free tip updated successfully!");


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


                alert("✅ Free tip published successfully!");

            }


            clearTipForm();

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

    });


// ==========================================
// LOAD FREE TIPS
// ==========================================

async function loadFreeTips() {

    const list =
        document.getElementById("tipsList");


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

        });


        // EDIT BUTTONS

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


        // DELETE BUTTONS

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
            "Load tips error:",
            error
        );

        list.innerHTML =
            "<p>Unable to load free tips.</p>";

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

            alert("This free tip no longer exists.");

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
            "❌ Could not load this tip."
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
            doc(db, "freeTips", id)
        );


        alert("✅ Free tip deleted.");


        loadFreeTips();


    } catch (error) {

        console.error(
            "Delete tip error:",
            error
        );

        alert(
            "❌ Could not delete tip:\n" +
            error.message
        );

    }

}


// ==========================================
// CLEAR FORM
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
// LOAD TIPS WHEN ADMIN OPENS
// ==========================================

loadFreeTips();
        
