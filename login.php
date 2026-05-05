<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Login</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/login.css">

    <script type="module">
        import { onLoginLoad } from '/swiftfound/script/login.js';
        window.onload = onLoginLoad;

        document.addEventListener('DOMContentLoaded', () => {
            const showPass = document.getElementById('showPassword');
            const passInput = document.getElementById('pass');
            showPass.addEventListener('change', () => {
                passInput.type = showPass.checked ? 'text' : 'password';
            });
        });
    </script>
</head>
<body>

    <div class="login-container">
        <!-- New Brand Title Section -->
        <div class="brand-title">
            <h1>SwiftFound</h1>
        </div>

        <a href="/swiftfound/" class="brand-link">← Return to Home</a>
        
        <h2>Welcome Back</h2>
        <p class="subtitle">Please enter your details</p>

        <form method="post" id="loginForm">
            <div class="form-group">
                <label for="uname">Username</label>
                <input type="text" id="uname" placeholder="Your username" required>
            </div>

            <div class="form-group">
                <label for="pass">Password</label>
                <input type="password" id="pass" placeholder="••••••••" required>
            </div>

            <div class="checkbox-group">
                <input type="checkbox" id="showPassword">
                <label for="showPassword" style="margin:0; cursor:pointer;">Show Password</label>
            </div>

            <input type="submit" value="Log In">
        </form>

        <p class="signup-link">Don't have an account? <a href="signup.php">Sign up here</a></p>
    </div>

</body>
</html>