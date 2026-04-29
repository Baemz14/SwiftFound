import { loadUserData } from "/swiftfound/script/user_utils.js";
import { logout } from "/swiftfound/script/logout.js";
import { callServer } from "/swiftfound/include/call_server.js";

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

    let posted_count = document.getElementById("posted_count");
    let user_items = await callServer("/swiftfound/php_server_call/user_items.php");
    posted_count.innerHTML = "youve posted " + user_items["items"].length + " items";

    let logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener('click', logout);
}