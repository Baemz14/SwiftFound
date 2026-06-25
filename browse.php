<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Browse Items</title>
    <meta name="description" content="Browse all lost and found items posted on SwiftFound.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/browse.css">

    <script type="module">
        import { onBrowseLoad } from "script/browse.js?v=4";
        window.onload = onBrowseLoad;
    </script>
</head>
<body>
    <nav class="navbar">
        <a href="index.php" class="logo">SwiftFound</a>
        <div class="nav-links" id="navLinks">
            <?php if (isset($_SESSION['user_id'])): ?>
                <a href="home.php">My Dashboard</a>
                <a href="chat.php" class="btn-nav-chat">Chat</a>
                <a href="item_form.php" class="btn-reg">Post Item</a>
            <?php else: ?>
                <a href="login.php" class="btn-nav-login">Login</a>
                <a href="signup.php" class="btn-reg">Register</a>
            <?php endif; ?>
        </div>
    </nav>

    <header class="search-container">
        <input type="text" id="searchInput" placeholder="Search items by title, location, or user...">

        <div class="filters">
            <select id="categoryFilter">
                <option value="">All Categories</option>
            </select>
            <input type="text" id="locationFilter" placeholder="Location">
            <div class="date-field">
                <span class="date-label">From</span>
                <input type="date" id="dateFrom" title="From date">
            </div>
            <div class="date-field">
                <span class="date-label">To</span>
                <input type="date" id="dateTo" title="To date">
            </div>
        </div>

        <div class="filter-row-bottom">
            <span class="filter-label">Show also:</span>
            <div class="status-filters">
                <label class="status-filter-item">
                    <input type="checkbox" id="showResolved">
                    <span>Resolved</span>
                </label>
                <label class="status-filter-item">
                    <input type="checkbox" id="showAbandoned">
                    <span>Abandoned</span>
                </label>
                <label class="status-filter-item">
                    <input type="checkbox" id="showOwnerConfirm">
                    <span>Owner Confirm</span>
                </label>
            </div>
        </div>
    </header>

    <main class="item-grid" id="listings_wrapper">
    </main>

</body>
</html>