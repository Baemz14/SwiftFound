import { loadUserData } from "/swiftfound/script/user_utils.js";

export async function homeLoad() {
    let user = await loadUserData();
    if(!user) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.php';
    }

    let welcome_text = document.getElementById("welcome_text");
    welcome_text.innerHTML = "welcome " + user.username + "!";

    let rep_text = document.getElementById("rep_text");
    rep_text.innerHTML = "your reputation is: " + user.reputation;
}