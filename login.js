console.log("LOGIN JS FILE LOADED");

const loginBtn = document.getElementById("loginBtn");

console.log("BUTTON FOUND:", loginBtn);

if (loginBtn) {

    loginBtn.addEventListener("click", function () {

        alert("✅ THE LOGIN BUTTON IS WORKING!");

        console.log("LOGIN BUTTON CLICKED");

    });

} else {

    alert("❌ LOGIN BUTTON NOT FOUND");

}
