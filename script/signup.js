import { callServer } from "../include/call_server.js";
import { checkIsLoggedIn, saveLogin } from "/swiftfound/script/user_utils.js";

export async function onSignupLoad() {
    let isLoggedIn = await checkIsLoggedIn();
    if (isLoggedIn) {
        alert("already logged in, redirecting to home page");
        window.location.href = '/swiftfound/home.php';        
    }

    let form = document.getElementById("signupForm");
    form.addEventListener('submit', onSignupSubmit);

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

async function onSignupSubmit(event) {
    event.preventDefault();

    var username = document.getElementById("uname").value;
    var password = document.getElementById("pass").value;
    var confPassword = document.getElementById("confPass").value;

    if (username === "" || password === "" || confPassword === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confPassword) {
        alert("Passwords do not match.");
        return;
    }

    let formData = new FormData();
    formData.append('uname', username);
    formData.append('pass', password);

    let data = await callServer('server_call/user_call.php', formData, "USER_EXIST");
    if (data.is_user_exist === 'true') {
        //TODO no alert buat dia tunjuk dkt petak input  "username already exist"
        alert("Username already exists.");
        return;
    }
    
    let data2 = await callServer('server_call/user_call.php', formData, "ADD_USER");
    if (!data2) {
        return;
    }
    if (data2.is_added === 'yes') {
        await saveLogin(data2.user.user_id);
        window.location.href = "/swiftfound/home.php";
    } else {
        alert("Add User Error: " + data2.error_log);
    }
}