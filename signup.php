<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Signup</title>
    
    <!-- Updated font weights to support the bold title -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/signup.css">

    <script type="module">
        import { onSignupLoad } from "/swiftfound/script/signup.js";
        window.onload = onSignupLoad;

        document.addEventListener('DOMContentLoaded', () => {
            const showPass = document.getElementById('showPassword');
            const passInput = document.getElementById('pass');
            const confInput = document.getElementById('confPass');
            
            showPass.addEventListener('change', () => {
                const type = showPass.checked ? 'text' : 'password';
                passInput.type = type;
                confInput.type = type;
            });
        });
    </script>
</head>
<body>

    <div class="signup-container">
        <!-- Brand Title added here -->
        <div class="brand-title">
            <h1>SwiftFound</h1>
        </div>

        <a href="/swiftfound/" class="brand-link">← Back to Frontpage</a>
        
        <h2>Create Account</h2>

        <form method="post" id="signupForm">
            <div class="form-group">
                <label for="uname">Username</label>
                <input type="text" id="uname" name="uname" placeholder="Enter your username" required>
            </div>

            <div class="form-group">
                <label for="pass">Password</label>
                <input type="password" id="pass" name="pass" placeholder="••••••••" required>
            </div>

            <div class="checkbox-group">
                <input type="checkbox" id="showPassword">
                <label for="showPassword" style="margin:0; cursor:pointer;">Show Password</label>
            </div>

            <div class="form-group">
                <label for="confPass">Confirm Password</label>
                <input type="password" id="confPass" placeholder="••••••••" required>
            </div>

            <input type="submit" value="Sign Up">
        </form>

        <p class="login-link">Already have an account? <a href="login.php">Login here</a></p>
    </div>

</body>
</html>