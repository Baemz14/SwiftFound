<?php
session_start();
$error = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($_POST['pass'] === "TAPAH2026") {
        $_SESSION['admin_auth'] = true;
        header("Location: admin_dashboard.php");
        exit();
    } else {
        $error = "ACCESS DENIED: Invalid Security Key";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Admin Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-card">
        <div class="admin-header">
            <div class="admin-logo">SwiftFound</div>
            <span class="badge">Staff Portal</span>
        </div>
        
        <h1>Admin Portal</h1>
        <p class="subtitle">Secure encrypted access for Tapah Campus Staff.</p>

        <?php if($error): ?>
            <div class="error-box">
                <span class="error-icon">⚠️</span> <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="" id="loginForm">
            <div class="input-group">
                <label>SECURITY KEY</label>
                <div class="input-wrapper">
                    <input type="password" name="pass" id="passInput" placeholder="••••••••" required autofocus>
                </div>
            </div>
            <button type="submit" class="primary-btn" id="authBtn">
                <span class="btn-text">Authorize Access</span>
                <div class="loader" id="loader"></div>
            </button>
        </form>

        <div class="admin-footer">
            <a href="home.php" class="back-link">← Return to User Dashboard</a>
        </div>
    </div>

    <script>
        // Interactive button feedback
        const form = document.getElementById('loginForm');
        const btn = document.getElementById('authBtn');
        const loader = document.getElementById('loader');
        const btnText = btn.querySelector('.btn-text');

        form.onsubmit = function() {
            btnText.style.display = 'none';
            loader.style.display = 'block';
            btn.style.opacity = '0.7';
            btn.style.cursor = 'wait';
        };
    </script>
</body>
</html>