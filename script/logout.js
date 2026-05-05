import { callServer } from "/swiftfound/include/call_server.js";

export async function logout() {
    let data = await callServer("/swiftfound/server_call/user_call.php", null, "LOGOUT");
    if (data['status'] && data['status'] === 'success') {
        window.location.href = "/swiftfound/";
    }
}