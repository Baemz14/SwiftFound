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
    const sidebarName = document.getElementById("sidebarUsername");
    const sidebarAvatarImg = document.getElementById("sidebarAvatarImg");
    const sidebarAvatarInitial = document.getElementById("sidebarAvatarInitial");
    if (sidebarName) sidebarName.innerText = user['username'];
    if (sidebarAvatarImg && sidebarAvatarInitial) {
        if (user.avatar_url) {
            sidebarAvatarImg.src = user.avatar_url;
            sidebarAvatarImg.style.display = 'block';
            sidebarAvatarInitial.style.display = 'none';
        } else {
            sidebarAvatarImg.style.display = 'none';
            sidebarAvatarInitial.style.display = 'block';
            sidebarAvatarInitial.innerText = user['username'].charAt(0).toUpperCase();
        }
    }
    const profileModal = document.getElementById('profileModal');
    const modalUsername = document.getElementById('modalUsername');
    const profilePanel = document.getElementById('profilePanel');
    const closeProfileModal = document.getElementById('closeProfileModal');
    if (modalUsername) modalUsername.innerText = user['username'];
    if (profilePanel) {
        profilePanel.addEventListener('click', () => {
            if (profileModal) profileModal.style.display = 'flex';
        });
        profilePanel.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (profileModal) profileModal.style.display = 'flex';
            }
        });
    }

    const avatarInput = document.getElementById('profileAvatarInput');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', async () => {
            if (!avatarInput || !avatarInput.files || avatarInput.files.length === 0) {
                alert('Select an image first.');
                return;
            }

            const file = avatarInput.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only JPG, PNG, or WEBP images are allowed.');
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const result = await callServer('/swiftfound/server_call/user_call.php', formData, 'UPLOAD_AVATAR');
                if (result.status === 'success') {
                    alert('Avatar uploaded successfully.');
                    if (result.avatar_url) {
                        const avatarImg = document.getElementById('sidebarAvatarImg');
                        const avatarInitial = document.getElementById('sidebarAvatarInitial');
                        if (avatarImg && avatarInitial) {
                            avatarImg.src = result.avatar_url;
                            avatarImg.style.display = 'block';
                            avatarInitial.style.display = 'none';
                        }
                    }
                    if (profileModal) profileModal.style.display = 'none';
                } else {
                    alert('Upload failed: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                alert('Upload failed: ' + error.message);
            }
        });
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => {
            if (profileModal) profileModal.style.display = 'none';
        });
    }

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

    // TODO: show all these user posted to ui
    let data = await callServer("/swiftfound/server_call/user_call.php", null, "USER_ITEMS");
    let items = data['items'];
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
    } else if (btnId === 'claimsBtn') {
        fetchMyClaims();
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

// --- POSTED ITEMS LOGIC ---
async function fetchPostedItems() {
    const section = document.getElementById('postedSect');
    
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

// --- NEW ACTIVE CLAIMS LOGIC ---
async function fetchMyClaims() {
    const grid = document.querySelector('#claimsSect .claim-grid');
    grid.innerHTML = "<p>Loading your claims...</p>";

    try {
        const response = await fetch('api/get_my_claims.php');
        const data = await response.json();

        if (data.status === 'success') {
            let pendingHtml = '<section><h3>Pending</h3><div style="display:flex; flex-direction:column; gap:10px;">';
            let approvedHtml = '<section><h3>Approved</h3><div style="display:flex; flex-direction:column; gap:10px;">';
            let rejectedHtml = '<section><h3>Rejected</h3><div style="display:flex; flex-direction:column; gap:10px;">';

            let pendingCount = 0, approvedCount = 0, rejectedCount = 0;

            data.claims.forEach(claim => {
                const imagePath = claim.img_file ? `/swiftfound/img_upload/${claim.img_file}` : 'https://via.placeholder.com/60?text=No+Image';
                
                let cardHtml = `
                    <div style="display: flex; gap: 15px; background: #fff; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; align-items: center;">
                        <img src="${imagePath}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                        <div>
                            <strong style="font-size: 1rem; color: #111827;">${claim.title}</strong>
                            <div style="font-size: 0.85rem; color: #6b7280; margin-top: 4px;">
                                Your Answer: <em>"${claim.answer_text}"</em>
                            </div>
                        </div>
                    </div>
                `;

                if (claim.is_approved == 0) {
                    pendingHtml += cardHtml;
                    pendingCount++;
                } else if (claim.is_approved == 1) {
                    approvedHtml += cardHtml;
                    approvedCount++;
                } else {
                    rejectedHtml += cardHtml;
                    rejectedCount++;
                }
            });

            if(pendingCount === 0) pendingHtml += "<p style='color: #6b7280; font-size: 0.9rem;'>No pending claims.</p>";
            if(approvedCount === 0) approvedHtml += "<p style='color: #6b7280; font-size: 0.9rem;'>No approved claims.</p>";
            if(rejectedCount === 0) rejectedHtml += "<p style='color: #6b7280; font-size: 0.9rem;'>No rejected claims.</p>";

            pendingHtml += '</div></section>';
            approvedHtml += '</div></section>';
            rejectedHtml += '</div></section>';

            grid.innerHTML = pendingHtml + approvedHtml + rejectedHtml;
        } else {
            grid.innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error("Failed to fetch claims:", error);
        grid.innerHTML = "<p style='color: red;'>Failed to load claims. Ensure get_my_claims.php is saved.</p>";
    }
}