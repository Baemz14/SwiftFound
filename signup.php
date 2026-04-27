<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Signup</title>

    <script type="module" src="script/signup.js"></script>
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