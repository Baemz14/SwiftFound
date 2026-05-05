import { callServer } from "../include/call_server.js";
import { checkIsLoggedIn } from "/swiftfound/script/user_utils.js";

export async function onLoginLoad() {
    let isLoggedIn = await checkIsLoggedIn()
    if (isLoggedIn) {
        alert("already logged in dada");
        window.location.href = '/swiftfound/home.php';        
    }

    let form = document.getElementById("loginForm");
    form.addEventListener('submit', onLoginSubmit);

    let showPass = document.getElementById("showPassword");
    showPass.addEventListener("change", toggleShowPassword);
}

function toggleShowPassword() {
    var passInput = document.getElementById("pass");
    var showPasswordCheckbox = document.getElementById("showPassword");

    if (showPasswordCheckbox.checked) {
        passInput.type = "text";
    } else {
        passInput.type = "password";
    }
}

async function onLoginSubmit(event) {
    event.preventDefault();
    
    var username = document.getElementById("uname").value;
    var password = document.getElementById("pass").value;

    if (username === "" || password === "") {
        alert("Please enter both username and password.");
        return;
    }

    let formData = new FormData();
    formData.append('uname', username);
    formData.append('pass', password);

    let data = await callServer('server_call/user_call.php', formData, "FIND_USER");
    if (data.status === 'success') {
        alert("Login successful");
        await saveLogin(data.user_id);
        window.location.href = "/swiftfound/home.php";
    } else {
        alert("Login failed");
    }

    return;
}

async function saveLogin(user_id) {
    let formData = new FormData();
    formData.append('user_id', user_id);
    let data = await callServer('server_call/user_call.php', formData, "LOGIN");
    if (data['status'] === 'success') {
        console.log("Login data saved");
    } else {
        alert("Failed to save login data");
    }
}