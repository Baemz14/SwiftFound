import { callServer } from "../include/call_server.js";

export async function checkIsLoggedIn() {
    //let data = await callServer('server_call/user_call.php', null, "GET_SESSDATA");
    //return data['is_logged_in'];
    
    // changed new code
    let user = await loadUserData();
    if(!user) {
        return false;
    }
    return true;
}

export async function loadUserData() {
    let data = await callServer('server_call/user_call.php', null, "GET_USER");
    if (!data.user_id) {
        return null;
    }

    return {
        "username": data.username,
        "reputation": data.reputation,
        "avatar_url": data.avatar_url || null
    };
}

export async function saveLogin(user_id) {
    let formData = new FormData();
    formData.append('user_id', user_id);
    let data = await callServer('server_call/user_call.php', formData, "LOGIN");
    if (data['status'] === 'success') {
        console.log("Login data saved");
    } else {
        alert("Failed to save login data");
    }
}