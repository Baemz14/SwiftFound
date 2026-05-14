<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Item</title>

    <link rel="stylesheet" href="css/item_detail.css">

    <script type="module">
        import { onItemLoad } from "/swiftfound/script/item_detail.js";
        window.onload = onItemLoad;
    </script>
</head>
<body>

<div class="container">
    <!-- Top Navigation -->
    <header class="page-header">
        <a href="browse.php" class="back-link">← Back to Browsing</a>
        <div class="logo" onclick="window.location.href='/swiftfound/'">Swift<span>Found</span></div>
    </header>

    <main class="item-details-grid">
        <!-- Left: Image Section -->
        <section class="image-section">
            <div class="main-image-container">
                <img alt="Item Image" id="item_image">
            </div>
        </section>

        <!-- Right: Information Section -->
        <section class="info-section">
            <div class="item-header">
                <span class="category-tag" id="category">Category Placeholder</span>
                <h1 class="item-title" id="title">Item Title Placeholder</h1>
                <p class="dt-cont">
                    <span class="dt-label">POSTED ON:</span> 
                    <span class="dt-value" id="detail_date">May 13, 2026, 05:54 PM</span>
                </p>
            </div>

            <div class="location-box">
                <strong>Location:</strong> 
                <span id="loc">Kuala Nerus, Terengganu</span>
            </div>

            <div class="description-box">
                <h3>Description</h3>
                <p id='desc'>
                    This is where the item description goes. Since it's a separate page, 
                    you have plenty of room to explain the condition of the item, 
                    where it was found, or any specific instructions for the claimant.
                </p>
            </div>

            <!-- Poster Identity Card -->
            <div class="poster-card">
                <div class="poster-meta">
                    <p><strong>Posted by:</strong> <span id="username">FaizAnwar57</span></p>
                    <p><strong>Reputation:</strong> <span id="rep">-1</span></p>
                </div>
                <button id="claimBtn" class="msg-btn">Claim</button>
            </div>

            <button id="reportBtn" class="report-btn">Report</button>
        </section>
    </main>
</div>

<div id="claimModal" class="modal-overlay" style="display: none;">
    <div class="modal-card">
        <h2>Claim Item</h2>
        <p>Ownership verification question</p>

        <label for="answer" id="question">some question</label>
        <input type="text" id="answer">

        <div class="modal-actions">
            <button id="cancelClaimBtn" class="btn-secondary">Cancel</button>
            <button id="submitClaimBtn" class="btn-claim">Claim</button>
        </div>
    </div>
</div>

<!-- Report Modal -->
<div id="reportModal" class="modal-overlay" style="display: none;">
    <div class="modal-card">
        <h2>Report Item</h2>
        <p>Let us know why you're reporting this item.</p>
        
        <label for="reportReason">Reason:</label>
        <select id="reportReason">
            <option value="">-- Select a reason --</option>
            <option value="inappropriate">Inappropriate Content</option>
            <option value="duplicate">Duplicate Listing</option>
            <option value="scam">Suspected Scam</option>
            <option value="damaged">Item Damaged/Not as Described</option>
            <option value="other">Other</option>
        </select>

        <label for="reportDetails">Additional Details (Optional):</label>
        <textarea id="reportDetails" rows="4" placeholder="Provide more information about your report..."></textarea>

        <div class="modal-actions">
            <button id="cancelReportBtn" class="btn-secondary">Cancel</button>
            <button id="submitReportBtn" class="btn-danger">Report</button>
        </div>
    </div>
</div>

</body>
</html>