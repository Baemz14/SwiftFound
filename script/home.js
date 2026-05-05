import { loadUserData } from "/swiftfound/script/user_utils.js";
import { logout } from "/swiftfound/script/logout.js";
import { callServer } from "/swiftfound/include/call_server.js";

const btnIdToSect = {
    'recentBtn': 'recentSect',
    'postedBtn': 'postedSect',
    'claimsBtn': 'claimsSect',
    'claimReqBtn': 'claimReqSect',
    'chatBtn': 'chatSect'
};

export async function homeLoad() {
    let user = await loadUserData();
    if(!user) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.php';
    }
    document.getElementById("usernameTxt").innerText = user['username'];

    document.getElementById("logoutBtn").addEventListener('click', logout);

    document.getElementById("recentBtn").addEventListener('click', function() {
        activateSection("recentBtn");
    });
    document.getElementById("postedBtn").addEventListener('click', function() {
        activateSection("postedBtn");
    });
    document.getElementById("claimsBtn").addEventListener('click', function() {
        activateSection("claimsBtn");
    });
    document.getElementById("claimReqBtn").addEventListener('click', function() {
        activateSection("claimReqBtn");
    });
    document.getElementById("chatBtn").addEventListener('click', function() {
        activateSection("chatBtn");
    });

    activateSection("recentBtn");
}

function activateSection(btnId) {
    if (!document.getElementById(btnId).classList.contains("active")) {
        document.getElementById(btnId).classList.add("active");
    }
    document.getElementById(btnIdToSect[btnId]).style.display = "";

    Object.entries(btnIdToSect).forEach(([btnIdi, sectIdi]) => {
        if (btnId !== btnIdi) {
            if (document.getElementById(btnIdi).classList.contains("active")) {
                document.getElementById(btnIdi).classList.remove("active");
            }
            document.getElementById(btnIdToSect[btnIdi]).style.display = "none";
        }
    });
}