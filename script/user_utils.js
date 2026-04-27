import { callServer } from "../include/call_server.js";

export async function checkIsLoggedIn() {
    let data = await callServer('php_server_call/get_sessdata.php');
    return data['is_logged_in'];
}

export async function loadUserData() {
    let data = await callServer('php_server_call/get_user.php', new FormData())
    if (!data.user_id) {
        return null;
    }

    return {
        "username": data.username,
        "reputation": data.reputation
    };
}