<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>

    <header>
        <a href="#" class="logo">SwiftFound</a>
        <nav>
            <a href="/swiftfound/home.php" class="nav-btn">home</a>
            <a href="login.php" class="nav-btn">Login / Register</a>
        </nav>
    </header>

    <main>
        <section class="hero">
            <h1>Lost something?</h1>
            <p>Tapah Campus | Lost & Found Network ;D</p>
            
            <div class="search-container">
                <form action="search.php" method="GET">
                    <input type="text" name="q" placeholder="Search e.g. 'Matric Card' or 'Blue Wallet'">
                </form>
                <a href="/swiftfound/browse.php">browse</a>
                <div style="margin: 20px 0; color: rgba(255,255,255,0.3); font-size: 0.8rem;">— OR —</div>
                <button class="btn-report" onclick="window.location.href='/swiftfound/item_form.php'">Post Found Item</button>
            </div>
        </section>
    </main>

</body>
</html>