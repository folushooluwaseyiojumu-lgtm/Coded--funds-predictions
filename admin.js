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
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* ==========================================
   ADMIN EMAIL
========================================== */

const ADMIN_EMAIL =
    "folushooluwaseyiojumu@gmail.com";


/* ==========================================
   ELEMENTS
========================================== */

const loginBox =
    document.getElementById("adminLoginBox");

const dashboard =
    document.getElementById("adminDashboard");

const loginBtn =
    document.getElementById("adminLoginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ==========================================
   ADMIN LOGIN
========================================== */

loginBtn.addEventListener("click", async () => {

    const email =
        document.getElementById("adminEmail")
            .value
            .trim();

    const password =
        document.getElementById("adminPassword")
            .value;


    if (!email || !password) {

        alert(
            "Please enter your admin email and password."
        );

        return;
    }


    if (email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()) {

        alert(
            "❌ This email is not the admin email."
        );

        return;
    }


    loginBtn.disabled = true;

    loginBtn.textContent =
        "Logging in...";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        alert(
            "✅ Admin login successful!"
        );


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        alert(
            "❌ Login failed:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );


        loginBtn.disabled = false;

        loginBtn.textContent =
            "🔐 Login as Admin";

    }

});


/* ==========================================
   CHECK LOGIN
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        loginBox.style.display =
            "block";

        dashboard.style.display =
            "none";

        return;
    }


    if (
        user.email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        alert(
            "❌ Access denied. Admin only."
        );

        await signOut(auth);

        return;
    }


    console.log(
        "Admin authenticated:",
        user.email
    );


    loginBox.style.display =
        "none";

    dashboard.style.display =
        "block";


    loadCountdown();

    loadMatches();

    loadFreeTips();

});


/* ==========================================
   SAVE COUNTDOWN
========================================== */

document
    .getElementById("saveCountdownBtn")
    .addEventListener("click", async () => {

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


        if (
            !homeTeam ||
            !awayTeam ||
            !matchDate
        ) {

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
                    homeTeam,
                    awayTeam,
                    matchDate,
                    updatedAt:
                        serverTimestamp()
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
                "❌ Countdown error:\n\n" +
                error.code +
                "\n\n" +
                error.message
            );

        }

    });


/* ==========================================
   ADD MATCH
========================================== */

document
    .getElementById("addMatchBtn")
    .addEventListener("click", async () => {

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
                collection(db, "matches"),
                {
                    home,
                    away,
                    status,
                    time,
                    score,
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
                error.code +
                "\n\n" +
                error.message
            );

        }

    });


/* ==========================================
   LOAD MATCHES
========================================== */

async function loadMatches() {

    const list =
        document.getElementById(
            "matchesList"
        );


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


        snapshot.forEach((matchDoc) => {

            const data =
                matchDoc.data();


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
                    Status: ${data.status}
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
                    data-id="${matchDoc.id}"
                >
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

        console.error(
            "Load matches error:",
            error
        );

        list.innerHTML =
            "<p>❌ Unable to load matches.</p>";

    }

}


/* ==========================================
   DELETE MATCH
========================================== */

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
            doc(db, "matches", id)
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
            error.code +
            "\n\n" +
            error.message
        );

    }

}


/* ==========================================
   LOAD COUNTDOWN
========================================== */

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


/* ==========================================
   ADD RESULT
========================================== */

document
    .getElementById("addResultBtn")
    .addEventListener("click", async () => {

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


        if (
            !home ||
            !away ||
            !score
        ) {

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
                    home,
                    away,
                    score,
                    info,
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
                error.code +
                "\n\n" +
                error.message
            );

        }

    });


/* ==========================================
   ADD / UPDATE FREE TIP
========================================== */

let editingTipId = null;


document
    .getElementById("addTipBtn")
    .addEventListener("click", async () => {

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

            if (editingTipId) {

                await setDoc(
                    doc(
                        db,
                        "freeTips",
                        editingTipId
                    ),
                    {
                        home,
                        away,
                        prediction,
                        odds,
                        date,
                        status,
                        updatedAt:
                            serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );


                alert(
                    "✅ Free tip updated!"
                );


                editingTipId = null;


            } else {

                await addDoc(
                    collection(
                        db,
                        "freeTips"
                    ),
                    {
                        home,
                        away,
                        prediction,
                        odds,
                        date,
                        status,
                        createdAt:
                            serverTimestamp()
                    }
                );


                alert(
                    "✅ Free tip published!"
                );

            }


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
                "❌ Could not save free tip:\n\n" +
                error.code +
                "\n\n" +
                error.message
            );

        }

    });


/* ==========================================
   LOAD FREE TIPS
========================================== */

async function loadFreeTips() {

    const list =
        document.getElementById(
            "tipsList"
        );


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
                    data-id="${tipDoc.id}"
                >
                    ✏️ Edit
                </button>

                <button
                    class="delete-tip"
                    data-id="${tipDoc.id}"
                >
                    🗑️ Delete
                </button>

            `;


            list.appendChild(card);

        });


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


/* ==========================================
   EDIT FREE TIP
========================================== */

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
                "This tip no longer exists."
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


/* ==========================================
   DELETE FREE TIP
========================================== */

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
            "❌ Could not delete tip:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );

    }

}


/* ==========================================
   CLEAR TIP FORM
========================================== */

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

}


/* ==========================================
   LOGOUT
========================================== */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            alert(
                "You have been logged out."
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "❌ Could not logout:\n\n" +
                error.message
            );

        }

    }
);
