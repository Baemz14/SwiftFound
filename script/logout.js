import { callServer } from "/swiftfound/include/call_server.js";

export async function logout() {
    let data = await callServer("/swiftfound/php_server_call/logout.php");
    if (data['status'] && data['status'] === 'success') {
        window.location.href = "/swiftfound/";
    }
}