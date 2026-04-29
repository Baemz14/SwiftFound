<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Login</title>
    
    <script type="module">
        import { onLoginLoad } from '/swiftfound/script/login.js';
        window.onload = onLoginLoad;
    </script>

</head>
<body>
    <a href="/swiftfound/">frontpage</a><br><br>

    <form method=post id="loginForm">
        <label for="uname">username:</label>
        <input type="text" id="uname"><br><br>

        <label for="pass">password:</label>
        <input type="password" id="pass">
        <label> Show Password</label>
        <input type="checkbox" id="showPassword"><br><br>

        <input type="submit" value="login">
    </form>

    <p>Don't have an account? <a href="signup.php">Sign up here</a></p>

</body>
</html>