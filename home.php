<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>
    
    <!-- Added Inter Font to match SwiftFound branding -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/home.css">

    <script type="module">
        import { homeLoad } from '/swiftfound/script/home.js';
        window.onload = homeLoad;
    </script>
</head>

<body>
    <div class="app-layout">
        <!-- Sidebar Navigation Card -->
        <nav class="sidebar">
            <div id="profilePanel" class="profile-preview" role="button" tabindex="0">
                <div id="sidebarAvatar" class="avatar-placeholder">
                    <img id="sidebarAvatarImg" class="avatar-image" alt="Profile avatar" />
                    <span id="sidebarAvatarInitial" class="avatar-initial">F</span>
                </div>
                <a href="/swiftfound/" class="logo">SwiftFound</a>
                <p id="sidebarUsername" class="profile-name">User</p>
                <p class="profile-role">Member Dashboard</p>
            </div>
            
            <div class="not-logout">
                <ul class="nav-links">
                    <li id='recentBtn' class="nav-buttons active">Recent Activity</li>
                    <li id='postedBtn' class="nav-buttons">My Posted Items</li>
                    <li id='claimsBtn' class="nav-buttons">My Active Claims</li>
                    <li id='claimReqBtn' class="nav-buttons">Claim Requests</li>
                </ul>   
                
                <div class="action-buttons">
                    <a class="other-buttons chat-btn" href="chat.php">Chat
                        <span class="btn-unread-badge" id="unread_chat">1</span>
                    </a>
                    <a class="other-buttons primary-btn" href="item_form.php">Post Item</a>
                    <a class="other-buttons secondary-btn" href="browse.php">Browse Items</a>
                </div>
            </div>

            <a id='logoutBtn' class="red-logout">Logout</a>
        </nav>

        <!-- Main Content Card -->
        <main class="content-area">
            <div id="recentSect" class="tab-content">
                <h1>Hello, <span id="usernameTxt">User</span>!</h1>
                <p class="subtitle">Here is what's happening with your items today.</p>
                <hr>
                <div class="placeholder-content">Quick stats and recent activity will go here.</div>
            </div>

            <div id="postedSect" class="tab-content" style="display:none;">
                <h1>My Posted Items</h1>
                <div id="postedItemsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                </div>
            </div>

            <div id="claimsSect" class="tab-content" style="display:none;">
                <h1>My Claims</h1>
                <div id="claimContainer" class="claim-grid">
                </div>
            </div>

            <div id="claimReqSect" class="tab-content" style="display:none;">
                <h1>Claim Requests</h1>
                <div id="claimReqContainer" class="claim-grid"></div>
            </div>
        </main>
    </div>

    <div id="profileModal" class="modal-overlay" style="display: none;">
        <div class="modal-card">
            <h2>My Profile</h2>
            <p><strong>Username:</strong> <span id="modalUsername">User</span></p>
            <p><strong>Status:</strong> Member</p>
            <div class="avatar-upload">
                <label for="profileAvatarInput">Upload profile photo</label>
                <input id="profileAvatarInput" type="file" accept="image/*">
                <button id="saveAvatarBtn" class="primary-btn">Save Avatar</button>
            </div>
            <div class="modal-actions">
                <button id="closeProfileModal" class="secondary-btn">Close</button>
                <a href="item_form.php" class="primary-btn">Post Item</a>
            </div>
        </div>
    </div>
</body>
</html>