<?php
session_start();

$error_message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $security_key = $_POST['pass'];

    // Define your secure key here
    if ($security_key === "your_secure_password_here") {
        $_SESSION['admin_auth'] = true;
        header("Location: admin_dashboard.php");
        exit();
    } else {
        $error_message = "ACCESS DENIED: INVALID SECURITY KEY";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Admin Authorization</title>
    
    <link rel="stylesheet" href="css/admin.css">
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
</head>
<body>

    <div class="admin-box">
        <h2>Admin Access</h2>

        <?php if (!empty($error_message)): ?>
            <div class="error-box">
                <?php echo $error_message; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
            <div class="input-container">
                <label for="pass">Security Key</label>
                <input type="password" id="pass" name="pass" placeholder="••••••••" required autofocus>
            </div>

            <button type="submit" class="admin-btn">Authorize System</button>
        </form>

        <div style="text-align: center; margin-top: 2rem;">
            <a href="index.php" style="color: var(--text-silver); text-decoration: none; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">
                Return to Terminal
            </a>
        </div>
    </div>

</body>
</html>