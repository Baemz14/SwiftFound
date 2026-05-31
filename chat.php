<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat</title>
    <link rel="stylesheet" href="css/chat.css">

    <script type="module">
        import { chatLoad } from '/swiftfound/script/chat.js';
        window.onload = chatLoad;
    </script>
</head>
<body>

    <nav class="top-navbar">
        <div class="logo-area">
            <a href="index.php">SwiftFound</a>
        </div>
        <div class="nav-links">
            <a href="home.php">Home</a>
            <a href="browse.php">Browse</a>
        </div>
    </nav>

    <div class="main-wrapper">
        <div class="sidebar">
            <div class="sidebar-tabs">
                <button class="sidebar-tab active" data-tab="myClaims">My Claims
                    <span class="btn-unread-badge" id="unread_claim">1</span>
                </button>
                <button class="sidebar-tab" data-tab="claimRequests">Claim Requests
                    <span class="btn-unread-badge" id="unread_request">2</span>
                </button>
            </div>
            <div class="sidebar-status-filters">
                <button class="status-tab active" data-status="all">All</button>
                <button class="status-tab" data-status="CHATTING">Chatting</button>
                <button class="status-tab" data-status="PENDING">Pending</button>
                <button class="status-tab" data-status="OWNER_CONFIRM">Owner Confirm</button>
                <div class="status-dropdown" id="statusDropdown">
                    <button id="statusDropdownToggle" class="status-tab dropdown-toggle" type="button">Archive ▾</button>
                    <div class="dropdown-menu" id="statusDropdownMenu">
                        <button class="dropdown-item" data-status="RESOLVED">Resolved</button>
                        <button class="dropdown-item" data-status="REJECTED">Rejected</button>
                        <button class="dropdown-item" data-status="CANCELED">Canceled</button>
                    </div>
                </div>
            </div>
            <div id="contactCont" class="contact-list">
            </div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
            <div id="chatCont" style="flex: 1; display: flex; flex-direction: column; height: 100%; min-height: 0;">

            </div>           
            <div id="chatDisabledNotice" class="chat-disabled-note" style="display:none;"></div>
            <div class="chat-input-area">
                <input id="messageTxt" type="text" placeholder="Type a message..." aria-label="Message text inputs">
                <button id="sendBtn" type="button">Send</button>
            </div>         
        </div>
    </div>

    <!-- Confirm Owner Modal -->
    <div id="confirmOwnerModal" class="modal">
        <div class="modal-content">
            <h2>Confirm as Owner</h2>
            <p>All other claimers for this item will be rejected.</p>
            <!-- TODO: write css class for this -->
            <div class="rejecting-list"> 
                <h3>Rejecting Claimers:</h3>
                <ul id="rejectingClaimersList">

                </ul>
            </div>
            <div class="modal-buttons">
                <button id="confirmOwnerBtn" class="btn-primary">Confirm</button>
                <button id="cancelOwnerBtn" class="btn-secondary">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Reject Claim Modal -->
    <div id="rejectClaimModal" class="modal">
        <div class="modal-content">
            <h2>Reject Claim</h2>
            <p>Are you sure you want to reject this claim?</p>
            <input type="text" id="rejectReasonInput" placeholder="Reason for rejection (optional)" aria-label="Reason for rejection">
            <div class="modal-buttons">
                <button id="rejectClaimBtn" class="btn-danger">Reject</button>
                <button id="cancelRejectBtn" class="btn-secondary">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Cancel Claim Modal -->
    <div id="cancelClaimModal" class="modal">
        <div class="modal-content">
            <h2>Cancel Claim</h2>
            <p>Are you sure you want to cancel this claim?</p>
            <input type="text" id="cancelReasonInput" placeholder="Reason for cancellation (optional)" aria-label="Reason for cancellation">
            <div class="modal-buttons">
                <button id="cancelClaimBtn" class="btn-secondary">Cancel Claim</button>
                <button id="cancelCancelBtn" class="btn-primary">Keep Claim</button>
            </div>
        </div>
    </div>

    <!-- Resolve Claim Modal -->
    <div id="resolveClaimModal" class="modal">
        <div class="modal-content">
            <h2>Resolve Claim</h2>
            <p>Are you sure you want to mark this claim as resolved?</p>
            <div class="modal-buttons">
                <button id="resolveClaimBtn" class="btn-primary">Resolve</button>
                <button id="cancelResolveBtn" class="btn-secondary">Cancel</button>
            </div>
        </div>
    </div>

</body>
</html>