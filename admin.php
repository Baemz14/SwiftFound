<?php
session_start();

// --- 1. DATABASE CONFIGURATION ---
$host = 'localhost';
$db_name = 'swiftfound_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// --- 2. LOGIN LOGIC ---
$error = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['uname']);
    $password = trim($_POST['pass']);

    if (!empty($username) && !empty($password)) {
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = :username LIMIT 1");
        $stmt->execute(['username' => $username]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin && password_verify($password, $admin['password'])) {
            $_SESSION['admin_user'] = $admin['username'];
            $_SESSION['is_admin'] = true;
            
            // Redirect to your dashboard page
            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Access Denied: Invalid Credentials";
        }
    } else {
        $error = "Please enter both fields.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Admin Control</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --admin-red: #ef4444;
            --bg-dark: #020617;
            --panel-bg: #0f172a;
            --text-silver: #cbd5e1;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-dark);
            background-image: radial-gradient(at 0% 0%, rgba(30, 41, 59, 1) 0, transparent 50%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .admin-box {
            background: var(--panel-bg);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 3rem 2.5rem;
            border-radius: 8px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 0 40px rgba(0,0,0,0.6);
            position: relative;
        }

        .admin-box::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--admin-red);
        }

        .error-box {
            background: rgba(239, 68, 68, 0.1);
            color: var(--admin-red);
            padding: 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-bottom: 1.5rem;
            text-align: center;
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        h2 { font-size: 1.5rem; margin: 0 0 2rem 0; text-transform: uppercase; text-align: center; }

        .input-container { margin-bottom: 1.5rem; }

        label { display: block; font-size: 0.75rem; color: var(--text-silver); margin-bottom: 0.5rem; text-transform: uppercase; }

        input[type="text"], input[type="password"] {
            width: 100%;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 4px;
            padding: 12px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            box-sizing: border-box;
        }

        .admin-btn {
            width: 100%;
            background: transparent;
            color: white;
            border: 1px solid var(--admin-red);
            padding: 14px;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
            cursor: pointer;
            transition: 0.3s;
        }

        .admin-btn:hover { background: var(--admin-red); }
    </style>
</head>
<body>

    <div class="admin-box">
        <h2>Admin Login</h2>

        <?php if ($error): ?>
            <div class="error-box"><?php echo $error; ?></div>
        <?php endif; ?>

        <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
            <div class="input-container">
                <label>Root Username</label>
                <input type="text" name="uname" required autocomplete="off">
            </div>

            <div class="input-container">
                <label>Security Key</label>
                <input type="password" name="pass" required>
            </div>

            <button type="submit" class="admin-btn">Authorize</button>
        </form>
    </div>

</body>
</html>