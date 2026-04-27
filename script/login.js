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

function validateLoginForm() {
    var username = document.getElementById("uname").value;
    var password = document.getElementById("pass").value;

    if (username === "" || password === "") {
        alert("Please enter both username and password.");
        return false; // Prevent form submission
    }

    let formData = new FormData();
    formData.append('uname', username);
    formData.append('pass', password);

    callServer('php_server_call/check_login.php', formData)
    .then(data => {
        if (data.status === 'success') {
            alert("Login successful");
        } else {
            alert("Login failed");
        }
    });

    return false;
}
window.validateLoginForm = validateLoginForm;