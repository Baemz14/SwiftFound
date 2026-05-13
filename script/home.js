import { loadUserData } from "/swiftfound/script/user_utils.js";
import { logout } from "/swiftfound/script/logout.js";
import { callServer } from "/swiftfound/include/call_server.js";

const btnIdToSect = {
    'recentBtn': 'recentSect',
    'postedBtn': 'postedSect',
    'claimsBtn': 'claimsSect',
    'claimReqBtn': 'claimReqSect',
    'chatBtn': 'chatSect'
};

export async function homeLoad() {
    let user = await loadUserData();
    if(!user) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.php';
        return; // Prevents further execution if not logged in
    }
    document.getElementById("usernameTxt").innerText = user['username'];

    document.getElementById("logoutBtn").addEventListener('click', logout);

    document.getElementById("recentBtn").addEventListener('click', function() {
        activateSection("recentBtn");
    });
    document.getElementById("postedBtn").addEventListener('click', function() {
        activateSection("postedBtn");
    });
    document.getElementById("claimsBtn").addEventListener('click', function() {
        activateSection("claimsBtn");
    });
    document.getElementById("claimReqBtn").addEventListener('click', function() {
        activateSection("claimReqBtn");
    });
    document.getElementById("chatBtn").addEventListener('click', function() {
        activateSection("chatBtn");
    });

    // This will activate the section and trigger the fetch logic below
    activateSection("recentBtn");
}

function activateSection(btnId) {
    if (!document.getElementById(btnId).classList.contains("active")) {
        document.getElementById(btnId).classList.add("active");
    }
    document.getElementById(btnIdToSect[btnId]).style.display = "";

    Object.entries(btnIdToSect).forEach(([btnIdi, sectIdi]) => {
        if (btnId !== btnIdi) {
            if (document.getElementById(btnIdi).classList.contains("active")) {
                document.getElementById(btnIdi).classList.remove("active");
            }
            document.getElementById(btnIdToSect[btnIdi]).style.display = "none";
        }
    });

    // Trigger the dynamic data fetch specifically when the tabs are activated
    if (btnId === 'recentBtn') {
        fetchRecentActivity();
    } else if (btnId === 'postedBtn') {
        fetchPostedItems();
    }
}

// --- RECENT ACTIVITY LOGIC ---
async function fetchRecentActivity() {
    const container = document.querySelector('#recentSect .placeholder-content');
    container.innerHTML = "<p>Loading recent activity...</p>";
    
    try {
        const response = await fetch('api/get_recent_activity.php');
        const data = await response.json();

        if (data.status === 'success') {
            if (data.recent_items.length === 0) {
                container.innerHTML = "<p>No recent activity. Start by posting an item!</p>";
                return;
            }

            let html = '<ul class="activity-list" style="list-style: none; padding: 0;">';
            data.recent_items.forEach(item => {
                const dateObj = new Date(item.created_at);
                const dateStr = dateObj.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' });
                
                const imagePath = item.img_file ? `/swiftfound/img_upload/${item.img_file}` : 'https://via.placeholder.com/60?text=No+Image'; 
                html += `
                    <li class="activity-item" style="display: flex; align-items: center; gap: 15px; background: #f8f9fa; border-left: 4px solid #4f46e5; padding: 12px 16px; margin-bottom: 10px; border-radius: 4px;">
                        <img src="${imagePath}" alt="Item image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                        <div>
                            <strong>[${item.found_or_lost}]</strong> ${item.title} 
                            <span style="color: #6c757d; font-size: 0.9em;">(${item.category})</span>
                            <div style="font-size: 0.85rem; color: #6c757d; margin-top: 4px;">Posted on ${dateStr}</div>
                        </div>
                    </li>
                `;
            });
            html += '</ul>';

            container.innerHTML = html;
        } else {
            container.innerHTML = `<p class="error" style="color: red;">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error("Failed to fetch activity:", error);
        container.innerHTML = "<p style='color: red;'>Failed to load recent activity.</p>";
    }
}

// --- NEW POSTED ITEMS LOGIC ---
async function fetchPostedItems() {
    const section = document.getElementById('postedSect');
    
    // Create a container for the items if it doesn't exist yet
    let container = document.getElementById('postedItemsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'postedItemsContainer';
        section.appendChild(container);
    }

    container.innerHTML = "<p>Loading your items...</p>";

    try {
        const response = await fetch('api/get_posted_items.php');
        const data = await response.json();

        if (data.status === 'success') {
            if (data.items.length === 0) {
                container.innerHTML = "<p>You haven't posted any items yet.</p>";
                return;
            }

            // Build a grid layout for the items
            let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">';
            
            data.items.forEach(item => {
                const dateObj = new Date(item.created_at);
                const dateStr = dateObj.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' });
                
                const imagePath = item.img_file ? `/swiftfound/img_upload/${item.img_file}` : 'https://via.placeholder.com/250x150?text=No+Image';

                html += `
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <img src="${imagePath}" alt="${item.title}" style="width: 100%; height: 160px; object-fit: cover;">
                        <div style="padding: 15px;">
                            <div style="font-size: 0.8rem; font-weight: bold; color: #4f46e5; margin-bottom: 5px;">[${item.found_or_lost}] ${item.category}</div>
                            <h3 style="margin: 0 0 8px 0; font-size: 1.1rem;">${item.title}</h3>
                            <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.description}</p>
                            <div style="font-size: 0.8rem; color: #9ca3af;">Posted on ${dateStr}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            container.innerHTML = html;
        } else {
            container.innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error("Failed to fetch posted items:", error);
        container.innerHTML = "<p style='color: red;'>Failed to load items. Check your connection.</p>";
    }
}