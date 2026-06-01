<?php
session_start();
$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Current security key: TAPAH2026
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
            <span class="badge">Staff Only</span>
        </div>

        <h1>Admin Portal</h1>
        <p class="subtitle">Enter the security key to access management tools.</p>

        <?php if($error): ?>
            <div class="error-box"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="POST" action="" id="loginForm">
            <div class="input-group">
                <label>SECURITY KEY</label>
                <input type="password" name="pass" placeholder="••••••••" required autofocus>
            </div>
            <button type="submit" class="primary-btn">Authorize Access</button>
        </form>

        <div class="admin-footer">
            <a href="home.php">← Back to Homepage</a>
        </div>
    </div>
</body>
</html>