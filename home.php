<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>
    <link rel="stylesheet" href="css/home.css">

    <script type="module">
        import { homeLoad } from '/swiftfound/script/home.js';
        window.onload = homeLoad;
    </script>
</head>

<body>
    <div class="app-layout">
        <nav class="sidebar">
            <div class="profile-preview">
                <div class="avatar-placeholder"></div>
                <a href="/swiftfound/" class="logo">SwiftFound</a>
            </div>
            
            <div class="not-logout">
                <ul class="nav-links">
                    <li id='recentBtn' class="nav-buttons">Recent Activity</li>
                    <li id='postedBtn' class="nav-buttons">My Posted Items</li>
                    <li id='claimsBtn' class="nav-buttons">My Active Claims</li>
                    <li id='claimReqBtn' class="nav-buttons">Claim Requests</li>
                    <li id='chatBtn' class="nav-buttons">Chat</li>
                </ul>   
                <a class="other-buttons" href="item_form.php">Post Item</a>
                <a class="other-buttons" href="browse.php">Browse Item</a>
            </div>

            <a id='logoutBtn' class="red-logout">logout</a>
        </nav>

        <section class="content-area">
            <div id="recentSect" class="tab-content">
                <h1>Welcome Back</h1>
                <p>Quick stats and recent activity will go here.</p>
            </div>

            <div id="postedSect" class="tab-content">
                <h1>My Posted Items</h1>
            </div>

            <div id="claimsSect" class="tab-content">
                <h1>pending claim</h1>
                <h1>approved claim</h1>
                <h1>rejected claim</h1>
            </div>

            <div id="claimReqSect" class="tab-content">
                <h1>people claiming my item</h1>
            </div>

            <div id="chatSect" class="tab-content">
                <h1>chat stuff</h1>
            </div>
        </section>
    </div>
</body>
</html>