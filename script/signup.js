import { callServer } from "../include/call_server.js";

function toggleShowPassword() {
    var passInput = document.getElementById("pass");
    var showPasswordCheckbox = document.getElementById("showPassword");

    if (showPasswordCheckbox.checked) {
        passInput.type = "text";
    } else {
        passInput.type = "password";
    }
}
window.toggleShowPassword = toggleShowPassword;

function validateSignupForm() {
    var username = document.getElementById("uname").value;
    var password = document.getElementById("pass").value;
    var confPassword = document.getElementById("confPass").value;

    if (username === "" || password === "" || confPassword === "") {
        alert("Please fill in all fields.");
        return false; // Prevent form submission
    }

    if (password !== confPassword) {
        alert("Passwords do not match.");
        return false; // Prevent form submission
    }

    let formData = new FormData();
    formData.append('uname', username);
    formData.append('pass', password);

    callServer('php_server_call/check_existed.php', formData)
    .then(data => {
        if (data.is_user_exist === 'yes') {
            alert("Username already exists.");
        }
        else {//oh no
            return callServer('php_server_call/add_user.php', formData);
        }
    })
    .then(data => {
        if (!data) {
            return; // No need to proceed if user already exists
        }
        if (data.is_added === 'yes') {
            alert("User added successfully.");
            window.location.href = "login.php";
        } else {
            alert("Add User Error: " + data.error_log);
        }
    });

    return false;
}
window.validateSignupForm = validateSignupForm;