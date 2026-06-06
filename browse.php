<<<<<<< Updated upstream
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
        import { onBrowseLoad } from "/swiftfound/script/browse.js?v=4";
        window.onload = onBrowseLoad;
    </script>
</head>
<body>
    <nav class="navbar">
        <a href="/swiftfound/" class="logo">SwiftFound</a>
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
            <input type="date" id="dateFrom" title="From date">
            <input type="date" id="dateTo" title="To date">
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
=======
<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>

    <link rel="stylesheet" href="css/browse.css">

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            const locationFilter = document.getElementById('locationFilter');
            const timeFilter = document.getElementById('timeFilter');
            
            // Checkbox elemen bagi status barang
            const resolvedCheck = document.getElementById('resolvedCheck');
            const abandonedCheck = document.getElementById('abandonedCheck');
            const confirmedCheck = document.getElementById('confirmedCheck');

            // Tarik data awal semasa mula-mula load page
            fetchCategories();
            fetchItems();

            // Event listener untuk penapisan input teks dan dropdown
            if(searchInput) searchInput.addEventListener('input', fetchItems);
            if(categoryFilter) categoryFilter.addEventListener('change', fetchItems);
            if(locationFilter) locationFilter.addEventListener('input', fetchItems);
            if(timeFilter) timeFilter.addEventListener('change', fetchItems);
            
            // Event listener untuk penapisan klik checkbox status
            if(resolvedCheck) resolvedCheck.addEventListener('change', fetchItems);
            if(abandonedCheck) abandonedCheck.addEventListener('change', fetchItems);
            if(confirmedCheck) confirmedCheck.addEventListener('change', fetchItems);
        });

        async function fetchItems() {
            const search = document.getElementById('searchInput')?.value || '';
            const category = document.getElementById('categoryFilter')?.value || '';
            const location = document.getElementById('locationFilter')?.value || '';
            const date = document.getElementById('timeFilter')?.value || '';
            
            // Ambil status tanda (1 = tick, 0 = untick)
            const resolved = document.getElementById('resolvedCheck')?.checked ? '1' : '0';
            const abandoned = document.getElementById('abandonedCheck')?.checked ? '1' : '0';
            const confirmed = document.getElementById('confirmedCheck')?.checked ? '1' : '0';
            
            const wrapper = document.getElementById('listings_wrapper');
            if (!wrapper) return;

            const params = new URLSearchParams({
                search: search,
                category: category,
                location: location,
                date: date,
                resolved: resolved,
                abandoned: abandoned,
                confirmed: confirmed
            });

            try {
                const response = await fetch(`api/get_items.php?${params.toString()}`);
                const items = await response.json();

                wrapper.innerHTML = ''; // Bersihkan grid kad lama

                if (items.error) {
                    console.error(items.error);
                    return;
                }

                if (items.length === 0) {
                    wrapper.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777; margin: 30px 0;">Tiada barang yang sepadan dengan carian anda.</p>`;
                    return;
                }

                items.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'item-card';
                    card.style.cursor = 'pointer';

                    // FIX 1: Selesaikan masalah gambar pecah
                    const imageSrc = (item.image_url && item.image_url.trim() !== '') ? item.image_url : 'images/default-item.jpg';

                    // FIX 2: Selesaikan masalah Invalid Date dengan validation isNaN
                    const dateObj = new Date(item.created_at);
                    const formattedDate = isNaN(dateObj.getTime()) ? 'Tiada Tarikh' : dateObj.toLocaleDateString('ms-MY');

                    card.innerHTML = `
                        <div class="item-card-img">
                            <img src="${imageSrc}" alt="${item.title}" onerror="this.onerror=null;this.src='images/default-item.jpg';">
                        </div>
                        <div class="card-info">
                            <span class="category-tag">${item.category_name || 'General'}</span>
                            <h3>${item.title}</h3>
                            <div class="card-meta">
                                <span>📍 ${item.location || 'N/A'}</span>
                            </div>
                            <div class="posted-by">
                                By: ${item.username || 'User'}
                            </div>
                            <div class="posted-at">
                                📅 ${formattedDate}
                            </div>
                        </div>
                    `;

                    // Pautan klik ke halaman butiran item
                    card.addEventListener('click', () => {
                        window.location.href = `item_detail.php?id=${item.id}`;
                    });

                    wrapper.appendChild(card);
                });

            } catch (error) {
                console.error('Error fetching items:', error);
            }
        }

        async function fetchCategories() {
            const catSelect = document.getElementById('categoryFilter');
            if (!catSelect) return;

            try {
                const response = await fetch('api/get_categories.php');
                if (response.ok) {
                    const categories = await response.json();
                    categories.forEach(cat => {
                        const opt = document.createElement('option');
                        opt.value = cat.id; 
                        opt.textContent = cat.name;
                        catSelect.appendChild(opt);
                    });
                }
            } catch (error) {
                console.log('Nota: Fail api/get_categories.php tiada atau tidak aktif.');
            }
        }
    </script>
</head>
<body>

    <nav class="navbar">
        <a href="/swiftfound/" class="logo">SwiftFound</a>
        
        <div class="nav-links">
            <a href="home.php">Home</a>
            <a href="browse.php">Browse</a>
            
            <?php if(isset($_SESSION['user_id'])): ?>
                <a href="post_item.php">Post Item</a>
                <a href="chat.php">Chat</a>
                <a href="dashboard.php" class="btn-reg">My Dashboard</a>
            <?php else: ?>
                <a href="login.php">Login</a>
                <a href="signup.php" class="btn-reg">Signup</a>
            <?php endif; ?>
        </div>
    </nav>

    <header class="search-container">
        <input type="text" id="searchInput" placeholder="Search items...">
        
        <div class="filters">
            <select id="categoryFilter">
                <option value="">All Categories</option>
            </select>

            <input type="text" id="locationFilter" placeholder="Location">
            <input type="date" id="timeFilter">
        </div>

        <div class="status-filters">
            <label class="status-filter-item">
                <input type="checkbox" id="resolvedCheck"> Show Resolved
            </label>
            <label class="status-filter-item">
                <input type="checkbox" id="abandonedCheck"> Show Abandoned
            </label>
            <label class="status-filter-item">
                <input type="checkbox" id="confirmedCheck"> Show Owner Confirmed
            </label>
        </div>
    </header>

    <main class="item-grid" id="listings_wrapper">
        </main>

</body>
>>>>>>> Stashed changes
</html>