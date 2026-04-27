<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Signup</title>

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

    </script>

</head>
<body>

    <form method=post action="login.php" onsubmit="return validateSignupForm()">
        <label for="uname">username:</label>
        <input type="text" id="uname" name="uname"><br><br>

        <label for="pass">password:</label>
        <input type="password" id="pass" name="pass">
        <label> Show Password</label>
        <input type="checkbox" id="showPassword" onclick="toggleShowPassword()"><br><br>

        <label for="pass">confirm password:</label>
        <input type="password" id="confPass"><br><br>

        <input type="submit" value="signup">
    </form>

    <p>Already have an account? <a href="login.php">Login here</a></p>

</body>
</html>