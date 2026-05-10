<?php
session_start();
$error = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($_POST['pass'] === "TAPAH2026") {
        $_SESSION['admin_auth'] = true;
        header("Location: admin_dashboard.php");
        exit();
    } else {
        $error = "Invalid Security Key";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-container">
        <h1>Admin Portal</h1>
        <p class="subtitle">Secure Access Only</p>

        <?php if($error): ?>
            <div class="error-message"><?php echo $error; ?></div>
        <?php endif; ?>

        <form method="POST" action="">
            <div class="input-group">
                <input type="password" name="pass" placeholder="Enter Security Key" required autofocus>
            </div>
            <button type="submit" class="admin-btn">Authorize</button>
        </form>

        <a href="index.php" class="back-link">← Return to Home</a>
    </div>
</body>
</html>