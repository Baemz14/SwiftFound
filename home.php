<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>
    
    <!-- Added Inter Font to match SwiftFound branding -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./css/home.css">

    <script type="module">
        import { homeLoad } from './script/home.js?v=5';
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
                <a href="index.php" class="logo">SwiftFound</a>
                <p id="sidebarUsername" class="profile-name">User</p>
                <p class="profile-role">Member Dashboard</p>
            </div>
            
            <div class="not-logout">
                <ul class="nav-links">
                    <li id='dashboardBtn' class="nav-buttons active">Dashboard</li>
                    <li id='postedBtn' class="nav-buttons">My Posted Items</li>
                    <li id='claimsBtn' class="nav-buttons">My Active Claims</li>
                    <li id='claimReqBtn' class="nav-buttons">
                        Claim Requests
                        <span class="nav-pending-badge" id="claimReqBadge" style="display:none;"></span>
                    </li>
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
            <div id="dashboardSect" class="tab-content">
                <div id="restrictedBanner" class="restricted-banner" style="display:none;">
                    <strong>Account Restricted</strong>
                    <p>You cannot post new items, claim items, or report items until an administrator removes your restriction.</p>
                </div>
                <h1>Hello, <span id="usernameTxt">User</span>!</h1>
                <p class="dash-welcome-sub">Here's a snapshot of your SwiftFound activity.</p>

                <!-- Quick Stats Row -->
                <div class="dash-stats-row">
                    <div class="dash-stat-card dash-stat-blue">
                        <div class="dash-stat-icon"></div>
                        <div class="dash-stat-info">
                            <div class="dash-stat-value" id="stat-posted">0</div>
                            <div class="dash-stat-label">Posted Items</div>
                        </div>
                    </div>
                    <div class="dash-stat-card dash-stat-purple">
                        <div class="dash-stat-icon"></div>
                        <div class="dash-stat-info">
                            <div class="dash-stat-value" id="stat-claims">0</div>
                            <div class="dash-stat-label">Active Claims</div>
                        </div>
                    </div>
                    <div class="dash-stat-card dash-stat-orange">
                        <div class="dash-stat-icon"></div>
                        <div class="dash-stat-info">
                            <div class="dash-stat-value" id="stat-pending">0</div>
                            <div class="dash-stat-label">Pending Requests</div>
                        </div>
                    </div>
                    <div class="dash-stat-card dash-stat-green">
                        <div class="dash-stat-icon"></div>
                        <div class="dash-stat-info">
                            <div class="dash-stat-value" id="stat-resolved">0</div>
                            <div class="dash-stat-label">Resolved</div>
                        </div>
                    </div>
                </div>

                <!-- Reputation Progress Card -->
                <div class="rep-card reputation-summary rep-novice">
                    <div class="rep-card-top">
                        <div class="rep-left">
                            <span id="reputationBadge" class="rep-pill">NOVICE</span>
                            <span class="rep-score">Reputation: <strong id="reputationScore">0</strong></span>
                        </div>
                        <div id="repNextLabel" class="rep-next-label">Next: HELPFUL at 20</div>
                    </div>

                    <div class="rep-bar-wrap">
                        <div class="rep-bar-track">
                            <div id="repBarFill" class="rep-bar-fill" style="width: 0%"></div>
                        </div>
                        <div class="rep-bar-ends">
                            <span id="repBarMin">0</span>
                            <span id="repBarMax">20</span>
                        </div>
                    </div>

                    <div class="rep-tiers">
                        <div class="rep-tier-dot caution">  <span class="dot"></span><span class="tier-label">CAUTION<br><small>&lt;0</small></span></div>
                        <div class="rep-tier-dot novice">   <span class="dot"></span><span class="tier-label">NOVICE<br><small>0</small></span></div>
                        <div class="rep-tier-dot helpful">  <span class="dot"></span><span class="tier-label">HELPFUL<br><small>20</small></span></div>
                        <div class="rep-tier-dot trusted">  <span class="dot"></span><span class="tier-label">TRUSTED<br><small>50</small></span></div>
                        <div class="rep-tier-dot guardian"> <span class="dot"></span><span class="tier-label">GUARDIAN<br><small>100</small></span></div>
                    </div>
                </div>

                <!-- How to Earn More Reputation -->
                <div class="dash-rep-tips">
                    <div class="dash-rep-tips-title">How Reputation Works</div>
                    <div class="dash-rep-tips-card">

                        <div class="rep-tip-section-label rep-tip-section-gain">Earn Reputation</div>

                        <div class="rep-tip-row">
                            <div class="rep-tip-icon rep-icon-green"><span class="rep-icon-sym">✓</span></div>
                            <div class="rep-tip-body">
                                <div class="rep-tip-label">Resolve an Item <span class="rep-tip-role">(as Poster)</span></div>
                                <div class="rep-tip-desc">Successfully confirm an item has been returned to its owner.</div>
                            </div>
                            <div class="rep-tip-badge rep-badge-green">+10</div>
                        </div>
                        <div class="rep-tip-divider"></div>
                        <div class="rep-tip-row">
                            <div class="rep-tip-icon rep-icon-blue"><span class="rep-icon-sym">✓</span></div>
                            <div class="rep-tip-body">
                                <div class="rep-tip-label">Resolve an Item <span class="rep-tip-role">(as Claimer)</span></div>
                                <div class="rep-tip-desc">Your claim is accepted and the item is successfully returned.</div>
                            </div>
                            <div class="rep-tip-badge rep-badge-blue">+5</div>
                        </div>

                        <div class="rep-tip-section-label rep-tip-section-lose">Lose Reputation</div>

                        <div class="rep-tip-row">
                            <div class="rep-tip-icon rep-icon-orange"><span class="rep-icon-sym">−</span></div>
                            <div class="rep-tip-body">
                                <div class="rep-tip-label">Cancel a Claim</div>
                                <div class="rep-tip-desc">Withdrawing a claim you previously submitted.</div>
                            </div>
                            <div class="rep-tip-badge rep-badge-orange">−1</div>
                        </div>
                        <div class="rep-tip-divider"></div>
                        <div class="rep-tip-row">
                            <div class="rep-tip-icon rep-icon-orange"><span class="rep-icon-sym">×</span></div>
                            <div class="rep-tip-body">
                                <div class="rep-tip-label">Claim Rejected</div>
                                <div class="rep-tip-desc">Claim rejected by poster.</div>
                            </div>
                            <div class="rep-tip-badge rep-badge-orange">−3</div>
                        </div>
                        <div class="rep-tip-divider"></div>
                        <div class="rep-tip-row">
                            <div class="rep-tip-icon rep-icon-red"><span class="rep-icon-sym">×</span></div>
                            <div class="rep-tip-body">
                                <div class="rep-tip-label">Abandon an Item</div>
                                <div class="rep-tip-desc">Leaving a posted item without resolution.</div>
                            </div>
                            <div class="rep-tip-badge rep-badge-red">−7</div>
                        </div>
                        <div class="rep-tip-divider"></div>
                        <div class="rep-tip-row">
                            <div class="rep-tip-icon rep-icon-red"><span class="rep-icon-sym">!</span></div>
                            <div class="rep-tip-body">
                                <div class="rep-tip-label">Reported &amp; Removed</div>
                                <div class="rep-tip-desc">Your item was reported and removed by an administrator.</div>
                            </div>
                            <div class="rep-tip-badge rep-badge-red">−15</div>
                        </div>

                    </div>
                </div>
            </div>

            <div id="postedSect" class="tab-content" style="display:none;">
                <h1>My Posted Items</h1>
                <p class="section-sub">Your items, sorted by status — active first.</p>
                <div class="sf-row" id="postedFilterTabs">
                    <button class="sf-tab active" data-filter="all">All</button>
                    <button class="sf-tab" data-filter="PENDING">Pending</button>
                    <button class="sf-tab" data-filter="RESOLVED">Resolved</button>
                    <button class="sf-tab" data-filter="ABANDONED">Abandoned</button>
                    <button class="sf-tab" data-filter="OWNER_CONFIRM">Owner Confirm</button>
                    <button class="sf-tab" data-filter="REMOVED">Removed</button>
                </div>
                <div id="postedItemsContainer" class="items-grid">
                </div>
            </div>

            <div id="claimsSect" class="tab-content" style="display:none;">
                <h1>My Active Claims</h1>
                <p class="section-sub">Items you've claimed — click any row to open chat.</p>
                <div class="sf-row" id="claimsFilterTabs">
                    <button class="sf-tab active" data-filter="all">All</button>
                    <button class="sf-tab" data-filter="PENDING">Pending</button>
                    <button class="sf-tab" data-filter="RESOLVED">Resolved</button>
                    <button class="sf-tab" data-filter="REJECTED">Rejected</button>
                    <button class="sf-tab" data-filter="CHATTING">Chatting</button>
                    <button class="sf-tab" data-filter="OWNER_CONFIRM">Owner Confirm</button>
                    <button class="sf-tab" data-filter="CANCELED">Canceled</button>
                    <button class="sf-tab" data-filter="PENDING_RESOLUTION">Pending Resolution</button>
                    <button class="sf-tab" data-filter="ABANDONED">Abandoned</button>
                </div>
                <div id="claimContainer" class="claim-grid">
                </div>
            </div>

            <div id="claimReqSect" class="tab-content" style="display:none;">
                <h1>Claim Requests</h1>
                <p class="section-sub">People requesting your posted items — PENDING requests shown first.</p>
                <div class="sf-row" id="claimReqFilterTabs">
                    <button class="sf-tab active" data-filter="all">All</button>
                    <button class="sf-tab" data-filter="PENDING">Pending</button>
                    <button class="sf-tab" data-filter="RESOLVED">Resolved</button>
                    <button class="sf-tab" data-filter="REJECTED">Rejected</button>
                    <button class="sf-tab" data-filter="CHATTING">Chatting</button>
                    <button class="sf-tab" data-filter="OWNER_CONFIRM">Owner Confirm</button>
                    <button class="sf-tab" data-filter="CANCELED">Canceled</button>
                    <button class="sf-tab" data-filter="PENDING_RESOLUTION">Pending Resolution</button>
                    <button class="sf-tab" data-filter="ABANDONED">Abandoned</button>
                </div>
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