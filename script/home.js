import * as userUtil from "/swiftfound/script/user_utils.js";
let loadUserData = userUtil.loadUserData;
import { logout } from "/swiftfound/script/logout.js";
import { callServer } from "/swiftfound/include/call_server.js";

const btnIdToSect = {
    'dashboardBtn': 'dashboardSect',
    'postedBtn': 'postedSect',
    'claimsBtn': 'claimsSect',
    'claimReqBtn': 'claimReqSect'
};
const btnIdToText = {
    'dashboardBtn': 'dashboard',
    'postedBtn': 'posted',
    'claimsBtn': 'claims',
    'claimReqBtn': 'claimReq'
}

let user = null;
let item = [];
let claim = [];
let claimReq = [];
let chatNotiCount = 0;

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function homeLoad() {
    user = await loadUserData();
    if(!user) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.php';
        return; // Prevents further execution if not logged in
    }
    console.log("User data loaded:", user);

    item = await userUtil.loadNewItem();
    claim = await userUtil.loadNewClaim();
    claimReq = await userUtil.loadNewClaimReq();
    chatNotiCount = await userUtil.getUnreadMessageCount();

    updateItemUi(item);
    updateClaimUi(claim);
    updateClaimReqUi(claimReq);
    updateChatNotiCount(chatNotiCount);

    document.getElementById("usernameTxt").innerText = user['username'];
    updateReputationUI(Number(user.reputation ?? 0));

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

    document.getElementById("dashboardBtn").addEventListener('click', function() {
        activateSection("dashboardBtn");
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
    let opening = urlParams.get('opening') ?? "dashboard";
    const btnId = Object.keys(btnIdToText).find(key => btnIdToText[key] === opening);
    activateSection(btnId);

    setInterval(checkNewThings, 1000);

    setupApproveConfirmModal();
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
        const imagePath = item.img_file ? `/swiftfound/img_upload/${escapeHtml(item.img_file)}` : 'https://via.placeholder.com/60?text=No+Image'; 
        let card = `
            <div id="item_${escapeHtml(item.item_id)}" class="item-card">
                <img src="${imagePath}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 160px; object-fit: cover;">
                <div style="padding: 15px;">
                    <div style="font-size: 0.8rem; font-weight: bold; color: #4f46e5; margin-bottom: 5px;">[${escapeHtml(item.status)}] ${escapeHtml(item.category)}</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 1.1rem;">${escapeHtml(item.title)}</h3>
                    <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(item.description)}</p>
                    <div style="font-size: 0.8rem; color: #9ca3af;">Posted on ${escapeHtml(dateStr)}</div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);

        document.getElementById(`item_${item.item_id}`).addEventListener('click', function(e) {
            window.location.href = `item_detail.php?item_id=${item.item_id}`;
        });
    }
}

function getReputationLabel(reputation) {
    if (Number.isNaN(reputation)) {
        return { label: 'NOVICE', className: 'rep-novice' };
    }
    if (reputation < 0) {
        return { label: 'CAUTIOS', className: 'rep-cautios' };
    }
    if (reputation <= 19) {
        return { label: 'NOVICE', className: 'rep-novice' };
    }
    if (reputation <= 49) {
        return { label: 'HELPFUL', className: 'rep-helpful' };
    }
    if (reputation <= 99) {
        return { label: 'TRUSTED', className: 'rep-trusted' };
    }
    return { label: 'GUARDIAN', className: 'rep-guardian' };
}

function updateReputationUI(rep) {
    const tiers = [
        { label: 'CAUTIOUS',  className: 'rep-cautios', min: -Infinity, max: -1,  dotClass: 'cautios' },
        { label: 'NOVICE',    className: 'rep-novice',  min: 0,         max: 19,  dotClass: 'novice'  },
        { label: 'HELPFUL',   className: 'rep-helpful', min: 20,        max: 49,  dotClass: 'helpful' },
        { label: 'TRUSTED',   className: 'rep-trusted', min: 50,        max: 99,  dotClass: 'trusted' },
        { label: 'GUARDIAN',  className: 'rep-guardian',min: 100,       max: Infinity, dotClass: 'guardian' },
    ];

    const current = tiers.find(t => rep >= t.min && rep <= t.max) ?? tiers[1];
    const nextIdx  = tiers.indexOf(current) + 1;
    const next     = tiers[nextIdx] ?? null;

    // Badge + score
    const badgeEl = document.getElementById('reputationBadge');
    const scoreEl = document.getElementById('reputationScore');
    if (badgeEl) badgeEl.textContent = current.label;
    if (scoreEl) scoreEl.textContent = isNaN(rep) ? '0' : rep;

    // Card theme class
    const panel = document.querySelector('.reputation-summary');
    if (panel) {
        panel.classList.remove('rep-cautios','rep-novice','rep-helpful','rep-trusted','rep-guardian');
        panel.classList.add(current.className);
    }

    // Progress bar
    const barFill  = document.getElementById('repBarFill');
    const barMin   = document.getElementById('repBarMin');
    const barMax   = document.getElementById('repBarMax');
    const nextLabel = document.getElementById('repNextLabel');

    if (current.label === 'GUARDIAN' || !next) {
        // Max tier — full bar
        if (barFill)   barFill.style.width = '100%';
        if (barMin)    barMin.textContent  = '100';
        if (barMax)    barMax.textContent  = '∞';
        if (nextLabel) nextLabel.textContent = '🏆 Max tier reached!';
    } else if (current.label === 'CAUTIOUS') {
        // Negative — fill based on distance from -∞ toward 0
        const pct = Math.max(0, Math.min(100, ((rep + 20) / 20) * 100));
        if (barFill)   { barFill.style.width = '0%'; setTimeout(() => barFill.style.width = pct + '%', 50); }
        if (barMin)    barMin.textContent  = rep;
        if (barMax)    barMax.textContent  = '0';
        if (nextLabel) nextLabel.textContent = `Next: NOVICE at 0  (${Math.abs(rep)} away)`;
    } else {
        const rangeMin = current.min;
        const rangeMax = next.min;
        const pct = Math.max(0, Math.min(100, ((rep - rangeMin) / (rangeMax - rangeMin)) * 100));
        if (barFill)   { barFill.style.width = '0%'; setTimeout(() => barFill.style.width = pct + '%', 50); }
        if (barMin)    barMin.textContent  = rangeMin;
        if (barMax)    barMax.textContent  = rangeMax;
        if (nextLabel) nextLabel.textContent = `Next: ${next.label} at ${next.min}  (${next.min - rep} away)`;
    }

    // Highlight active tier dot
    document.querySelectorAll('.rep-tier-dot').forEach(el => el.classList.remove('active'));
    const activeDot = document.querySelector(`.rep-tier-dot.${current.dotClass}`);
    if (activeDot) activeDot.classList.add('active');
}

function statusPillHtml(status) {
    const map = {
        'PENDING':       ['status-pending',       'Pending'],
        'CHATTING':      ['status-chatting',       'Chatting'],
        'OWNER_CONFIRM': ['status-owner-confirm',  'Owner Confirm'],
        'RESOLVED':      ['status-resolved',       'Resolved'],
        'REJECTED':      ['status-rejected',       'Rejected'],
        'CANCELED':      ['status-canceled',       'Canceled'],
    };
    const [cls, label] = map[status] || ['status-pending', status];
    return `<span class="status-pill ${cls}">${label}</span>`;
}

function updateClaimUi(newClaim) {
    if (newClaim.length <= 0) {
        return;
    }
    const container = document.getElementById('claimContainer');
    for (const claim of newClaim) {
        const imagePath = claim.img_file ? `/swiftfound/img_upload/${escapeHtml(claim.img_file)}` : 'https://via.placeholder.com/60?text=No+Image';
        let card = `
            <div id="claim_${escapeHtml(claim.claim_id)}" class="claim-row">
                <img src="${imagePath}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <strong style="font-size: 1rem; color: #111827;">${escapeHtml(claim.title)}</strong>
                        ${statusPillHtml(claim.claim_status)}
                    </div>
                    <div style="font-size: 0.85rem; color: #6b7280; margin-top: 4px;">
                        Your Answer: <em>&quot;${escapeHtml(claim.answer_text)}&quot;</em>
                    </div>
                </div>
                <div style="flex-shrink: 0;">
                    <button class="row-btn row-btn-secondary" id="editClaimBtn_${escapeHtml(claim.claim_id)}">Edit</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
        
        document.getElementById(`editClaimBtn_${claim.claim_id}`).addEventListener('click', function() {
            window.location.href = `item_detail.php?item_id=${claim.item_id}`;
        });
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
        const imagePath = item.img_file ? `/swiftfound/img_upload/${escapeHtml(item.img_file)}` : 'https://via.placeholder.com/60?text=No+Image';
        const isPending = claim.claim_status === 'PENDING';
        const isChatting = claim.claim_status === 'CHATTING' || claim.claim_status === 'OWNER_CONFIRM';
        let actionBtn = '';
        if (isPending) {
            actionBtn = `<button class="row-btn row-btn-primary" data-open-btn>✓ Approve &amp; Chat</button>`;
        } else if (isChatting) {
            actionBtn = `<button class="row-btn row-btn-secondary" data-open-btn>Open Chat</button>`;
        }
        let card = `
            <div id="claimReq_${escapeHtml(claim.claim_id)}" class="claim-req-row">
                <img src="${imagePath}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <strong style="font-size: 1rem; color: #111827;">${escapeHtml(item.title)}</strong>
                        ${statusPillHtml(claim.claim_status)}
                    </div>
                    <div style="font-size: 0.85rem; color: #6b7280; margin-top: 4px;">
                        ${escapeHtml(claimer.username)}&#39;s Answer: <em>&quot;${escapeHtml(claim.answer_text)}&quot;</em>
                    </div>
                </div>
                <div style="flex-shrink: 0; display: flex; gap: 6px;">
                    ${actionBtn}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
        const row = document.getElementById(`claimReq_${claim.claim_id}`);
        const openBtn = row ? row.querySelector('[data-open-btn]') : null;
        if (openBtn) {
            if (isPending) {
                openBtn.addEventListener('click', function() {
                    openApproveConfirm(claim);
                });
            } else {
                openBtn.addEventListener('click', function() {
                    openChat(claim);
                });
            }
        }
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

let _pendingApprovalClaim = null;

function setupApproveConfirmModal() {
    const modal = document.getElementById('approveConfirmModal');
    document.getElementById('confirmApproveCancel').addEventListener('click', () => {
        modal.style.display = 'none';
        _pendingApprovalClaim = null;
    });
    document.getElementById('confirmApproveOk').addEventListener('click', async () => {
        if (!_pendingApprovalClaim) return;
        modal.style.display = 'none';
        await openChat(_pendingApprovalClaim);
        _pendingApprovalClaim = null;
    });
}

function openApproveConfirm(claim) {
    _pendingApprovalClaim = claim;
    document.getElementById('confirmClaimerName').textContent = claim.claimer.username;
    document.getElementById('confirmClaimerRep').textContent = claim.claimer.reputation ?? '—';
    document.getElementById('confirmAnswerBox').textContent = claim.answer_text;
    document.getElementById('approveConfirmModal').style.display = 'flex';
}

async function openChat(claim) {
    if (claim.claim_status !== 'CHATTING' && claim.claim_status !== 'OWNER_CONFIRM') {
        const ok = await userUtil.openChat(claim);
        if (!ok) {
            alert('o no something went wong!');
            throw new Error('server error opening chat');
        }
    }
    window.location.href = `/swiftfound/chat.php?opening=${claim.claim_id}`;
}