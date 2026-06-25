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
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- Chart.js CDN -->
    <script type="module">
        import { onAdminDashboardLoad } from "script/admin_dashboard.js?v=2";
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

            <h1 class="dash-section-title">Graphs Analysis</h1>
            <p class="dash-section-sub">Analysis for stuffs.</p>
            <div class='additional-stats'>
                <div id='userAnalysis' class='sub-analysis' data-section="user">
                    <h2>User Analysis</h2>
                    <div class="time-filter-btns">
                        <button class="filter-btn" data-time-filter="monthly">Monthly</button>
                        <button class="filter-btn" data-time-filter="weekly">Weekly</button>
                        <button class="filter-btn active" data-time-filter="daily">Daily</button>
                    </div>
                    <div style="width: 100%; margin-top: 20px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto; padding: 0;">
                            <h3 class="sub-heading" style="display: block; width: 100%; text-align: center; margin: 0 0 15px 0; padding: 0;">
                                User Registrations by Date
                            </h3>            
                            <div class="chart-container" style="display: block; width: 100%; position: relative; margin-left: 0; padding: 0;">
                                <canvas id="userChart"></canvas>
                            </div>
                        </div>
                    </div>  
                    <div style="width: 100%; margin-top: 20px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto; padding: 0;">
                            <h3 class="sub-heading" style="display: block; width: 100%; text-align: center; margin: 0 0 15px 0; padding: 0;">
                                User Reputation Frequency
                            </h3>            
                            <div class="chart-container" style="display: block; width: 100%; position: relative; margin-left: 0; padding: 0;">
                                <canvas id="userFreqChart"></canvas>
                            </div>
                        </div>
                    </div>  
                </div>
                <div id='itemAnalysis' class='sub-analysis' data-section="item">
                    <h2>Item Analysis</h2>
                    <div class="time-filter-btns">
                        <button class="filter-btn" data-time-filter="monthly">Monthly</button>
                        <button class="filter-btn" data-time-filter="weekly">Weekly</button>
                        <button class="filter-btn active" data-time-filter="daily">Daily</button>
                    </div>
                    <div style="width: 100%; margin-top: 20px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto;">
                            
                            <h3 class="sub-heading" style="text-align: center; margin: 0 0 15px 0; width: 100%;">
                                Items Logged by Date
                            </h3>            
                            
                            <div class="chart-container">
                                <canvas id="itemChart"></canvas>
                            </div>    
                            
                        </div>
                    </div>  
                    <div style="width: 100%; margin-top: 30px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto;">
                            <h3 class="sub-heading" style="text-align: center; margin: 0 0 15px 0; width: 100%;">
                                Item Status Breakdown
                            </h3>
                            <div class='chart-container'>
                                <canvas id="itemStatusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div id='claimAnalysis' class='sub-analysis' data-section="claim">
                    <h2>Claim Analysis</h2>
                    <div class="time-filter-btns">
                        <button class="filter-btn" data-time-filter="monthly">Monthly</button>
                        <button class="filter-btn" data-time-filter="weekly">Weekly</button>
                        <button class="filter-btn active" data-time-filter="daily">Daily</button>
                    </div>
                    <div style="width: 100%; margin-top: 20px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto;">
                            <h3 class="sub-heading" style="text-align: center; margin: 0 0 15px 0; width: 100%;">
                                Claims Initiated by Date
                            </h3>            
                            <div class="chart-container">
                                <canvas id="claimChart"></canvas>
                            </div>    
                        </div>
                    </div>

                    <div style="width: 100%; margin-top: 30px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto;">
                            <h3 class="sub-heading" style="text-align: center; margin: 0 0 15px 0; width: 100%;">
                                Claim Status Breakdown
                            </h3>
                            <div class='chart-container'>
                                <canvas id="claimStatusChart"></canvas>
                            </div>
                            <div class="breakdown-grid" id="breakdownGrid">
                                <div class="loading-text">Loading…</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id='messageAnalysis' class='sub-analysis' data-section="message">
                    <h2>Message Analysis</h2>
                    <div class="time-filter-btns">
                        <button class="filter-btn" data-time-filter="monthly">Monthly</button>
                        <button class="filter-btn" data-time-filter="weekly">Weekly</button>
                        <button class="filter-btn active" data-time-filter="daily">Daily</button>
                    </div>
                    <div style="width: 100%; margin-top: 20px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto;">
                            <h3 class="sub-heading" style="text-align: center; margin: 0 0 15px 0; width: 100%;">
                                Message Volume by Date
                            </h3>            
                            <div class="chart-container">
                                <canvas id="messageChart"></canvas>
                            </div>    
                        </div>
                    </div>  
                </div>

                <div id='reportAnalysis' class='sub-analysis' data-section="report">
                    <h2>Report Analysis</h2>
                    <div class="time-filter-btns">
                        <button class="filter-btn" data-time-filter="monthly">Monthly</button>
                        <button class="filter-btn" data-time-filter="weekly">Weekly</button>
                        <button class="filter-btn active" data-time-filter="daily">Daily</button>
                    </div>
                    <div style="width: 100%; margin-top: 20px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto;">
                            <h3 class="sub-heading" style="text-align: center; margin: 0 0 15px 0; width: 100%;">
                                Incident Reports by Date
                            </h3>            
                            <div class="chart-container">
                                <canvas id="reportChart"></canvas>
                            </div>    
                        </div>
                    </div>  
                    <div style="width: 100%; margin-top: 30px;">
                        <div style="display: block; width: 100%; max-width: 600px; margin-left: 0; margin-right: auto;">
                            <h3 class="sub-heading" style="text-align: center; margin: 0 0 15px 0; width: 100%;">
                                Report Status Breakdown
                            </h3>
                            <div class='chart-container'>
                                <canvas id="reportStatusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reports Section -->
        <div id="reportsSect" class="dash-section">
            <h1 class="dash-section-title">User Reports</h1>
            <p class="dash-section-sub">Review and resolve platform reports.</p>

            <div class="filter-bar" id="reportFilterBar">
                <button class="filter-btn active" data-filter="ALL">All</button>
                <button class="filter-btn" data-filter="PENDING">Pending</button>
                <button class="filter-btn" data-filter="ACCEPTED">Accepted</button>
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
            
            <div class="users-controls">
                <input type="text" id="userSearch" placeholder="Search by username…" class="user-search-input">
                <div class="users-sort-btns">
                    <button class="sort-btn" data-sort="username">Username</button>
                    <button class="sort-btn" data-sort="reputation">Reputation</button>
                    <button class="sort-btn" data-sort="item_count">Items</button>
                    <button class="sort-btn" data-sort="claim_count">Claims</button>
                    <button class="sort-btn" data-sort="is_restricted">Restricted</button>
                </div>
            </div>
            
            <div id="usersContainer">
                <div class="loading-text">Loading users…</div>
            </div>
        </div>

    </main>
</div>
</body>
</html>
