<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>

    <link rel="stylesheet" href="css/browse.css">

    <script type="module">
        import { onBrowseLoad } from "/swiftfound/script/browse.js";
        window.onload = onBrowseLoad;
    </script>
</head>
<body>
    <nav class="navbar">
        <a href="/swiftfound/" class="logo">SwiftFound</a>
        <div class="nav-links">
            <a href="home.php">Home</a>
            <a href="login.php">Login</a>
            <a href="signup.php" class="btn-reg">Signup</a>
        </div>
    </nav>

    <header class="search-container">
        <input type="text" id="searchInput" placeholder="Search items...">
        
        <div class="filters">
            <select id="categoryFilter">
                <option value="">All Categories</option>
            </select>

            <input type="text" id="locationFilter" placeholder="Location">
            <input type="date" id="timeFilter">
        </div>
    </header>

    <main class="item-grid" id="listings_wrapper">
    </main>

</body>
</html>