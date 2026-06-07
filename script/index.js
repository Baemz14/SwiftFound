import { loadUserData, getUnreadMessageCount } from "./user_utils.js";
import { loadNewStats } from "./admin_utils.js";

let stats = {};

export async function onIndexLoad() {
    stats = await loadNewStats();
    console.log(stats);

    document.getElementById('itemPosted').innerText = stats['total_items'];
    document.getElementById('totalUsers').innerText = stats['total_users'];
    document.getElementById('messageSent').innerText = stats['total_messages'];

    const btnHome = document.getElementById("btnHome");
    const btnChat = document.getElementById("btnChat");
    const btnLogin = document.getElementById("btnLogin");
    const btnRegister = document.getElementById("btnRegister");
    const userPanel = document.getElementById("userPanel");
    const userNameHeader = document.getElementById("userNameHeader");
    const heroGreeting = document.getElementById("heroGreeting");
    const heroChatBadge = document.getElementById("heroChatBadge");
    const chatBadge = document.getElementById("chatBadge");

    let user = await loadUserData();
    if (!user) {
        if (btnHome) btnHome.style.display = "none";
        if (btnChat) btnChat.style.display = "none";
        if (userPanel) userPanel.style.display = "none";
        if (btnLogin) btnLogin.style.display = "";
        if (btnRegister) btnRegister.style.display = "";
        return;
    }

    if (btnHome) btnHome.style.display = "";
    if (btnLogin) btnLogin.style.display = "none";
    if (btnRegister) btnRegister.style.display = "none";
    if (btnChat) btnChat.style.display = "inline-flex";
    if (userPanel) userPanel.style.display = "grid";
    if (userNameHeader) userNameHeader.innerText = user.username;
    if (heroGreeting) heroGreeting.innerText = `Welcome back, ${user.username}!`;

    const unreadCount = await getUnreadMessageCount();
    const unreadText = unreadCount > 99 ? '99+' : String(unreadCount);
    if (unreadCount > 0) {
        if (chatBadge) {
            chatBadge.innerText = unreadText;
            chatBadge.style.display = "inline-flex";
        }
        if (heroChatBadge) {
            heroChatBadge.innerText = unreadText;
            heroChatBadge.style.display = "inline-flex";
        }
    } else {
        if (chatBadge) {
            chatBadge.style.display = "none";
        }
        if (heroChatBadge) {
            heroChatBadge.style.display = "none";
        }
    }
}

function drawStats() {

}
