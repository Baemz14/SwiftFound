import * as userUtil from "/swiftfound/script/user_utils.js";
let loadUserData = userUtil.loadUserData;
import { logout } from "/swiftfound/script/logout.js";
import { callServer } from "/swiftfound/include/call_server.js";

const btnIdToSect = {
    'recentBtn': 'recentSect',
    'postedBtn': 'postedSect',
    'claimsBtn': 'claimsSect',
    'claimReqBtn': 'claimReqSect'
};
const btnIdToText = {
    'recentBtn': 'recent',
    'postedBtn': 'posted',
    'claimsBtn': 'claims',
    'claimReqBtn': 'claimReq'
}

let item = [];
let claim = [];
let claimReq = [];
let chatNotiCount = 0;

export async function homeLoad() {
    let user = await loadUserData();
    if(!user) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.php';
        return; // Prevents further execution if not logged in
    }

    item = await userUtil.loadNewItem();
    claim = await userUtil.loadNewClaim();
    claimReq = await userUtil.loadNewClaimReq();
    chatNotiCount = await userUtil.getUnreadMessageCount();

    updateItemUi(item);
    updateClaimUi(claim);
    updateClaimReqUi(claimReq);
    updateChatNotiCount(chatNotiCount);

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

    const urlParams = new URLSearchParams(window.location.search);
    let opening = urlParams.get('opening') ?? "recent";
    const btnId = Object.keys(btnIdToText).find(key => btnIdToText[key] === opening);
    activateSection(btnId);

    setInterval(checkNewThings, 1000);
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

    const url = new URL(window.location);
    url.searchParams.set('opening', btnIdToText[btnId]);
    window.history.pushState({}, '', url);
}

async function checkNewThings() {
    let newItem = await userUtil.loadNewItem(item);
    if (newItem.length > 0) {
        console.log("new item came through");
        item.push(...newItem);
        updateItemUi(newItem);
    }
    let newClaim = await userUtil.loadNewClaim(claim);
    if (newClaim.length > 0) {
        console.log("new claim came through");
        claim.push(...newClaim);
        updateClaimUi(newClaim);
    }
    let newClaimReq = await userUtil.loadNewClaimReq(claimReq);
    if (newClaimReq.length > 0) {
        console.log("new claim request came through");
        claimReq.push(...newClaimReq);
        updateClaimReqUi(newClaimReq);
    }
    let newNotiCount = await userUtil.getUnreadMessageCount();
    if (newNotiCount !== chatNotiCount) {
        console.log(`new noti count: ${newNotiCount}`);
        chatNotiCount = newNotiCount;
        updateChatNotiCount(chatNotiCount);
    }
}

function updateChatNotiCount(count) {
    const badge = document.getElementById('unread_chat');
    if (count > 0) {
        badge.innerText = count > 99 ? '99+' : count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function updateItemUi(newItem) {
    if (newItem.length <= 0) {
        return;
    }
    let container = document.getElementById('postedItemsContainer');
    for (const item of newItem) {
        const dateObj = new Date(item.created_at);
        const dateStr = dateObj.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' });
        const imagePath = item.img_file ? `/swiftfound/img_upload/${item.img_file}` : 'https://via.placeholder.com/60?text=No+Image'; 
        let card = `
            <div id="item_${item.item_id}" class="item-card">
                <img src="${imagePath}" alt="${item.title}" style="width: 100%; height: 160px; object-fit: cover;">
                <div style="padding: 15px;">
                    <div style="font-size: 0.8rem; font-weight: bold; color: #4f46e5; margin-bottom: 5px;">[${item.status}] ${item.category}</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 1.1rem;">${item.title}</h3>
                    <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.description}</p>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Posted on ${dateStr}</div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);

        document.getElementById(`item_${item.item_id}`).addEventListener('click', function(e) {
            window.location.href = `item_detail.php?item_id=${item.item_id}`;
        });
    }
}

function updateClaimUi(newClaim) {
    if (newClaim.length <= 0) {
        return;
    }
    const container = document.getElementById('claimContainer');
    for (const claim of newClaim) {
        const imagePath = claim.img_file ? `/swiftfound/img_upload/${claim.img_file}` : 'https://via.placeholder.com/60?text=No+Image';
        let card = `
            <div id="claim_${claim.claim_id}" class="claim-row">
                <img src="${imagePath}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div style="display: flex; width: 100%">
                    <div>
                        <strong style="font-size: 1rem; color: #111827;">${claim.title}</strong>
                        <div style="font-size: 0.85rem; color: #6b7280; margin-top: 4px;">
                            Your Answer: <em>"${claim.answer_text}"</em>
                        </div>
                    </div>
                </div>
                <div style="flex-shrink: 0;">
                    <button>edit</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    }
}

function clearClaimReqUi() {
    document.getElementById('claimReqContainer').innerHTML = "";
}

function updateClaimReqUi(newClaimReq) {
    if (newClaimReq.length <= 0) {
        return;
    }
    console.log(newClaimReq);
    const container = document.getElementById('claimReqContainer');
    for (const claim of newClaimReq) {
        let item = claim.item;
        let claimer = claim.claimer;
        let poster = claim.poster;
        const imagePath = item.img_file ? `/swiftfound/img_upload/${item.img_file}` : 'https://via.placeholder.com/60?text=No+Image';
        let card = `
            <div id="claimReq_${claim.claim_id}" class="claim-req-row">
                <img src="${imagePath}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div style="display: flex; width: 100%">
                    <div>
                        <strong style="font-size: 1rem; color: #111827;">[${claim.claim_status}] ${item.title}</strong>
                        <div style="font-size: 0.85rem; color: #6b7280; margin-top: 4px;">
                            ${claimer.username}'s Answer: <em>"${claim.answer_text}"</em>
                        </div>
                    </div>
                </div>
                <div style="flex-shrink: 0;">
                    <button id="openBtn">${claim.claim_status === "PENDING"? "approve and": ""} open chat</button>
                    <button>view claimer</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
        document.querySelector(`#claimReq_${claim.claim_id} #openBtn`).addEventListener('click', function(e) {
            openChat(claim);
        });
    }
}

function updateChatUi(newChat) {
    if (newChat.length <= 0) {
        return;
    }
}

function onClaimEdit(e) {

}

function onViewClaimer(e) {

}

async function openChat(claim) {
    if(claim.claim_status !== "CHATTING") {
        if (!userUtil.openChat(claim)) {
            alert('o no something went wong!');
            throw new Error('server error opening chat');
        }
    }
    window.location.href = `/swiftfound/chat.php?opening=${claim.claim_id}`;
}

// --- RECENT ACTIVITY LOGIC ---
// async function fetchRecentActivity() {
//     const container = document.querySelector('#recentSect .placeholder-content');
//     container.innerHTML = "<p>Loading recent activity...</p>";
    
//     try {
//         const response = await fetch('api/get_recent_activity.php');
//         const data = await response.json();

//         if (data.status === 'success') {
//             if (data.recent_items.length === 0) {
//                 container.innerHTML = "<p>No recent activity. Start by posting an item!</p>";
//                 return;
//             }

//             let html = '<ul class="activity-list" style="list-style: none; padding: 0;">';
//             data.recent_items.forEach(item => {
//                 const dateObj = new Date(item.created_at);
//                 const dateStr = dateObj.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' });
                
//                 const imagePath = item.img_file ? `/swiftfound/img_upload/${item.img_file}` : 'https://via.placeholder.com/60?text=No+Image'; 
//                 html += `
//                     <li class="activity-item" style="display: flex; align-items: center; gap: 15px; background: #f8f9fa; border-left: 4px solid #4f46e5; padding: 12px 16px; margin-bottom: 10px; border-radius: 4px;">
//                         <img src="${imagePath}" alt="Item image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
//                         <div>
//                             <strong>[${item.found_or_lost}]</strong> ${item.title} 
//                             <span style="color: #6c757d; font-size: 0.9em;">(${item.category})</span>
//                             <div style="font-size: 0.85rem; color: #6c757d; margin-top: 4px;">Posted on ${dateStr}</div>
//                         </div>
//                     </li>
//                 `;
//             });
//             html += '</ul>';

//             container.innerHTML = html;
//         } else {
//             container.innerHTML = `<p class="error" style="color: red;">Error: ${data.message}</p>`;
//         }
//     } catch (error) {
//         console.error("Failed to fetch activity:", error);
//         container.innerHTML = "<p style='color: red;'>Failed to load recent activity.</p>";
//     }
// }