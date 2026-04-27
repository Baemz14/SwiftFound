<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Login</title>

    <script src="include/call_server.js"></script>
    <script>

    function toggleShowPassword() {
        var passInput = document.getElementById("pass");
        var showPasswordCheckbox = document.getElementById("showPassword");

        if (showPasswordCheckbox.checked) {
            passInput.type = "text";
        } else {
            passInput.type = "password";
        }
    }

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

    </script>

</head>
<body>

    <form method=post action="login.php" onsubmit="return validateLoginForm()">
        <label for="uname">username:</label>
        <input type="text" id="uname"><br><br>

        <label for="pass">password:</label>
        <input type="password" id="pass">
        <label> Show Password</label>
        <input type="checkbox" id="showPassword" onclick="toggleShowPassword()"><br><br>

        <input type="submit" value="login">
    </form>

    <p>Don't have an account? <a href="signup.php">Sign up here</a></p>

</body>
</html>