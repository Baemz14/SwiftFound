<?php
session_start();
if (!isset($_SESSION['admin_auth']) || !$_SESSION['admin_auth']) {
    header("Location: admin.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/admin_dashboard.css">
    <script type="module">
        import { onAdminDashboardLoad } from "/swiftfound/script/admin_dashboard.js?v=2";
        window.onload = onAdminDashboardLoad;
    </script>
</head>
<body>
<div class="dash-layout">

    <!-- Sidebar -->
    <nav class="dash-sidebar">
        <div class="dash-logo">SwiftFound</div>
        <div class="dash-logo-sub">Admin Panel</div>

        <ul class="dash-nav">
            <li class="active" data-section="statsSect">
                <span class="dash-nav-icon">📊</span> Statistics
            </li>
            <li data-section="reportsSect">
                <span class="dash-nav-icon">🚩</span> User Reports
                <span id="pendingBadge" style="margin-left:auto; display:none;"></span>
            </li>
            <li data-section="usersSect">
                <span class="dash-nav-icon">👥</span> Users
            </li>
        </ul>

        <div class="dash-sidebar-bottom">
            <a href="admin.php?logout=1" class="dash-logout" id="logoutBtn">← Logout</a>
        </div>
    </nav>

    <!-- Main -->
    <main class="dash-main">

        <!-- Statistics Section -->
        <div id="statsSect" class="dash-section active">
            <h1 class="dash-section-title">Platform Statistics</h1>
            <p class="dash-section-sub">Live overview of SwiftFound activity.</p>

            <div class="stats-grid" id="statsGrid">
                <div class="loading-text">Loading stats…</div>
            </div>

            <p class="sub-heading">Claim Status Breakdown</p>
            <div class="breakdown-grid" id="breakdownGrid">
                <div class="loading-text">Loading…</div>
            </div>
        </div>

        <!-- Reports Section -->
        <div id="reportsSect" class="dash-section">
            <h1 class="dash-section-title">User Reports</h1>
            <p class="dash-section-sub">Review and resolve platform reports.</p>

            <div class="filter-bar" id="reportFilterBar">
                <button class="filter-btn active" data-filter="ALL">All</button>
                <button class="filter-btn" data-filter="PENDING">Pending</button>
                <button class="filter-btn" data-filter="RESOLVED">Resolved</button>
                <button class="filter-btn" data-filter="DISMISSED">Dismissed</button>
            </div>

            <div class="report-list" id="reportList">
                <div class="loading-text">Loading reports…</div>
            </div>
        </div>

        <!-- Users Section -->
        <div id="usersSect" class="dash-section">
            <h1 class="dash-section-title">Users</h1>
            <p class="dash-section-sub">All registered platform members.</p>
            <div id="usersContainer">
                <div class="loading-text">Loading users…</div>
            </div>
        </div>

    </main>
</div>
</body>
</html>
