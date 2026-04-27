<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Login</title>

    <script type="module" src="script/login.js"></script>
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