import { callServer } from "/swiftfound/include/call_server.js";

function logout() {
    callServer("/swiftfound/php_server_call/logout.php")
    .then( data => {
        if (data['status'] && data['status'] === 'success') {
            window.location.href = "/swiftfound/"
        }
    });
}
window.logout = logout;