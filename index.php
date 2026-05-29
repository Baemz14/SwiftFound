<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Welcome</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <!-- The ?v=2 forces the browser to load the NEW css -->
    <link rel="stylesheet" href="css/index.css?v=2">

    <script type="module">
        import { onIndexLoad } from '/swiftfound/script/index.js';
        window.onload = onIndexLoad;
    </script>
</head>
<body>

    <header>
        <a href="#" class="logo">SwiftFound</a>
        <nav>
            <a id=btnHome href="/swiftfound/home.php" class="nav-btn">Home</a>
            <a id=btnLogin href="login.php" class="nav-btn login-cta">Login</a>
            <a id=btnRegister href="signup.php" class="nav-btn login-cta">Register</a>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-text">
                <h1>Lost something?</h1>
                <p class="campus-tag">Tapah Campus | Lost & Found Network ;D</p>
            </div>
            
            <div class="search-card">
                <form action="search.php" method="GET" class="search-form">
                    <input type="text" name="q" placeholder="Search for lost items..." disabled>
                </form>
                
                <div class="button-stack">
                    <a class="btn-primary" href="/swiftfound/browse.php">Browse Items</a>
                    <div class="or-divider"><span>OR</span></div>
                    <a class="btn-secondary" href="/swiftfound/item_form.php">Post Found Item</a>
                </div>
            </div>
        </section>
    </main>

</body>
</html>