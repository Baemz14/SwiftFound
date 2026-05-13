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

            <button class="report-btn">Report</button>
        </section>
    </main>
</div>

</body>
</html>