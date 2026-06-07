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

    <header class="site-header">
        <a href="/swiftfound/" class="logo">SwiftFound</a>
        <nav class="nav-links">
            <a id="btnHome" href="/swiftfound/home.php" class="nav-btn nav-secondary">Dashboard</a>
            <a id="btnChat" href="/swiftfound/chat.php" class="nav-btn nav-secondary chat-link" style="display:none;">
                <span>Chat</span>
                <span id="chatBadge" class="nav-badge">0</span>
            </a>
            <a id="btnLogin" href="login.php" class="nav-btn login-cta">Login</a>
            <a id="btnRegister" href="signup.php" class="nav-btn login-cta">Register</a>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-copy">
                <span class="eyebrow">Campus Lost & Found</span>
                <h1>Recover missing items faster with SwiftFound.</h1>
                <p>Connect finders, owners, and campus helpers in one clean workflow with instant chat, claim tracking, and trusted handoffs.</p>

                <div class="hero-actions">
                    <a class="btn-primary" href="/swiftfound/browse.php">Browse Items</a>
                    <a class="btn-secondary" href="/swiftfound/item_form.php">Post Found Item</a>
                </div>

                <div class="hero-features">
                    <span class="feature-pill">safe claim system</span>
                    <span class="feature-pill">Real-time chat</span>
                    <span class="feature-pill">Admin moderation</span>
                </div>
            </div>

            <div class="hero-panel">
                <div class="hero-card">
                    <div class="hero-card-top">
                        <div>
                            <p class="subtitle">Campus connection</p>
                            <h2 id="heroGreeting">A friendlier way to reunite lost items.</h2>
                        </div>
                        <div class="hero-status">Live</div>
                    </div>
                    <p class="hero-card-copy">Search for missing items, claim ownership securely, and keep your conversations organised through the built-in chat system.</p>

                    <div class="hero-stats-grid">
                        <div class="hero-stat-card">
                            <strong id='itemPosted'>15K+</strong>
                            <span>Items posted</span>
                        </div>
                        <div class="hero-stat-card">
                            <strong id='totalUsers'>1.2K</strong>
                            <span>Total users</span>
                        </div>
                        <div class="hero-stat-card">
                            <strong id='messageSent'>100</strong>
                            <span>Message sent</span>
                        </div>
                    </div>

                    <div id="userPanel" class="user-panel" style="display:none;">
                        <div class="user-welcome">Signed in as <strong id="userNameHeader"></strong></div>
                        <a id="heroChatBtn" class="hero-chat-btn" href="/swiftfound/chat.php">
                            <span>Open chat</span>
                            <span id="heroChatBadge" class="chat-badge">0</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section class="feature-grid">
            <div class="section-head">
                <h2>Why SwiftFound?</h2>
                <p>Built for campus life, designed to help lost items find their way home quickly.</p>
            </div>
            <div class="feature-cards">
                <article class="feature-card">
                    <div class="feature-icon">💬</div>
                    <h3>Instant chat</h3>
                    <p>Message finders and claimants directly so you can verify details without waiting.</p>
                </article>
                <article class="feature-card">
                    <div class="feature-icon">🛡️</div>
                    <h3>Trusted workflow</h3>
                    <p>Claim submissions are tracked and verified so every handoff is safer and simpler.</p>
                </article>
                <article class="feature-card">
                    <div class="feature-icon">✨</div>
                    <h3>Clear design</h3>
                    <p>Easy navigation, strong visual hierarchy, and action-focused pages help you move faster.</p>
                </article>
            </div>
        </section>

        <section class="workflow-section">
            <div class="section-head">
                <h2>How it works</h2>
                <p>Move from lost item to recovered item in three simple steps.</p>
            </div>
            <div class="workflow-grid">
                <div class="workflow-card">
                    <span class="workflow-step">1</span>
                    <h4>Post or browse</h4>
                    <p>Share found items or review the latest campus reports to spot your lost item.</p>
                </div>
                <div class="workflow-card">
                    <span class="workflow-step">2</span>
                    <h4>Claim securely</h4>
                    <p>Submit a claim and answer the verification details to keep the process trustworthy.</p>
                </div>
                <div class="workflow-card">
                    <span class="workflow-step">3</span>
                    <h4>Chat & return</h4>
                    <p>Open the built-in chat, confirm the handoff, and complete the recovery in one place.</p>
                </div>
            </div>
        </section>
    </main>

</body>
</html>