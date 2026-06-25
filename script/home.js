import * as userUtil from "user_utils.js";
let loadUserData = userUtil.loadUserData;
import { logout } from "logout.js";
import { callServer } from "../include/call_server.js";

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

// Status ordering priority (lower index = shown first)
const STATUS_ORDER = ['PENDING', 'CHATTING', 'OWNER_CONFIRM', 'RESOLVED', 'REJECTED', 'CANCELED', 'ABANDONED', 'AVAILABLE', 'LOST'];
function statusSortKey(status) {
    const idx = STATUS_ORDER.indexOf(status);
    return idx === -1 ? 99 : idx;
}

export async function homeLoad() {
    user = await loadUserData();
    if(!user) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.php';
        return;
    }
    console.log(user);

    if (parseInt(user.is_restricted) === 1) {
        document.getElementById('restrictedBanner').style.display = 'block';
    }

    item = await userUtil.loadNewItem();
    claim = await userUtil.loadNewClaim();
    claimReq = await userUtil.loadNewClaimReq();
    chatNotiCount = await userUtil.getUnreadMessageCount();

    updateItemUi(item);
    updateClaimUi(claim);
    updateClaimReqUi(claimReq);
    updateChatNotiCount(chatNotiCount);
    updateDashboardStats();

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
                const result = await callServer('../server_call/user_call.php', formData, 'UPLOAD_AVATAR');
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


    setupFilters();
}

function setupFilters() {
    ['posted', 'claims', 'claimReq'].forEach(prefix => {
        const tabs = document.querySelectorAll(`#${prefix}FilterTabs .sf-tab`);
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (prefix === 'posted') applyPostedFilter();
                if (prefix === 'claims') applyClaimsFilter();
                if (prefix === 'claimReq') applyClaimReqFilter();
            });
        });
    });
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
        item.push(...newItem);
        updateItemUi(newItem);
        updateDashboardStats();
    }
    let newClaim = await userUtil.loadNewClaim(claim);
    if (newClaim.length > 0) {
        claim.push(...newClaim);
        updateClaimUi(newClaim);
        updateDashboardStats();
    }
    let newClaimReq = await userUtil.loadNewClaimReq(claimReq);
    if (newClaimReq.length > 0) {
        claimReq.push(...newClaimReq);
        // Full re-render so pending ones stay on top
        document.getElementById('claimReqContainer').innerHTML = '';
        updateClaimReqUi(claimReq);
        updateDashboardStats();
    }
    let newNotiCount = await userUtil.getUnreadMessageCount();
    if (newNotiCount !== chatNotiCount) {
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

// ─── Item Status Pill (for posted items) ───────────────────────────────────────
function itemStatusPillHtml(status) {
    const map = {
        'AVAILABLE':     { cls: 'item-status-available',     label: 'Available' },
        'LOST':          { cls: 'item-status-lost',          label: 'Lost' },
        'OWNER_CONFIRM': { cls: 'item-status-owner-confirm', label: 'Owner Confirm' },
        'RESOLVED':      { cls: 'item-status-resolved',      label: 'Resolved' },
        'ABANDONED':     { cls: 'item-status-abandoned',     label: 'Abandoned' },
        'CLAIMED':       { cls: 'item-status-claimed',       label: 'Claimed' },
    };
    const info = map[status] || { cls: 'item-status-default', label: status };
    return `<span class="item-status-pill ${info.cls}">${info.label}</span>`;
}

// ─── Claim Status Pill ─────────────────────────────────────────────────────────
function statusPillHtml(status) {
    const map = {
        'PENDING':       ['status-pending',       'Pending'],
        'CHATTING':      ['status-chatting',      'Chatting'],
        'OWNER_CONFIRM': ['status-owner-confirm', 'Owner Confirm'],
        'RESOLVED':      ['status-resolved',      'Resolved'],
        'REJECTED':      ['status-rejected',      'Rejected'],
        'CANCELED':      ['status-canceled',      'Canceled'],
    };
    const [cls, label] = map[status] || ['status-pending', status];
    return `<span class="status-pill ${cls}">${label}</span>`;
}

// ─── Dashboard stats ───────────────────────────────────────────────────────────
function updateDashboardStats() {
    const pendingReqs  = claimReq.filter(c => c.claim_status === 'PENDING').length;
    const activeClaims = claim.filter(c => c.claim_status === 'CHATTING' || c.claim_status === 'OWNER_CONFIRM').length;
    const resolvedCount = claim.filter(c => c.claim_status === 'RESOLVED').length;
    const postedCount  = item.length;

    const el = id => document.getElementById(id);
    if (el('stat-posted'))   el('stat-posted').textContent   = postedCount;
    if (el('stat-claims'))   el('stat-claims').textContent   = activeClaims;
    if (el('stat-pending'))  el('stat-pending').textContent  = pendingReqs;
    if (el('stat-resolved')) el('stat-resolved').textContent = resolvedCount;

    // Update claim req nav button badge
    const claimReqBadge = document.getElementById('claimReqBadge');
    if (claimReqBadge) {
        if (pendingReqs > 0) {
            claimReqBadge.textContent = pendingReqs;
            claimReqBadge.style.display = 'inline-flex';
        } else {
            claimReqBadge.style.display = 'none';
        }
    }
}

// ─── Posted Items ──────────────────────────────────────────────────────────────
function updateItemUi(newItem) {
    if (newItem.length <= 0) return;

    // Sort: active statuses first
    const sorted = [...newItem].sort((a, b) => statusSortKey(a.status) - statusSortKey(b.status));

    let container = document.getElementById('postedItemsContainer');
    for (const item of sorted) {
        const dateObj = new Date(item.created_at);
        const dateStr = dateObj.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' });
        const imagePath = item.img_file
            ? `../img_upload/${escapeHtml(item.img_file)}`
            : 'https://placehold.co/300x160/eef2ff/6366f1?text=No+Image';
        let card = `
            <div id="item_${escapeHtml(item.item_id)}" class="item-card item-row" style="cursor:pointer;" data-status="${escapeHtml(item.status)}">
                <div class="item-card-img-wrap">
                    <img src="${imagePath}" alt="${escapeHtml(item.title)}" class="item-card-img">
                    <div class="item-card-status-overlay">${itemStatusPillHtml(item.status)}</div>
                </div>
                <div class="item-card-body">
                    <div class="item-card-category">${escapeHtml(item.category)}</div>
                    <h3 class="item-card-title">${escapeHtml(item.title)}</h3>
                    <p class="item-card-desc">${escapeHtml(item.description)}</p>
                    <div class="item-card-date">📅 ${escapeHtml(dateStr)}</div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);

        document.getElementById(`item_${item.item_id}`).addEventListener('click', function() {
            window.location.href = `item_detail.php?item_id=${item.item_id}`;
        });
    }
}

function getReputationLabel(reputation) {
    if (Number.isNaN(reputation)) return { label: 'NOVICE', className: 'rep-novice' };
    if (reputation < 0)   return { label: 'CAUTIOUS', className: 'rep-caution' };
    if (reputation <= 19) return { label: 'NOVICE',  className: 'rep-novice' };
    if (reputation <= 49) return { label: 'HELPFUL', className: 'rep-helpful' };
    if (reputation <= 99) return { label: 'TRUSTED', className: 'rep-trusted' };
    return { label: 'GUARDIAN', className: 'rep-guardian' };
}

function updateReputationUI(rep) {
    const tiers = [
        { label: 'CAUTIOUS',  className: 'rep-caution', min: -Infinity, max: -1,  dotClass: 'caution' },
        { label: 'NOVICE',    className: 'rep-novice',  min: 0,         max: 19,  dotClass: 'novice'  },
        { label: 'HELPFUL',   className: 'rep-helpful', min: 20,        max: 49,  dotClass: 'helpful' },
        { label: 'TRUSTED',   className: 'rep-trusted', min: 50,        max: 99,  dotClass: 'trusted' },
        { label: 'GUARDIAN',  className: 'rep-guardian',min: 100,       max: Infinity, dotClass: 'guardian' },
    ];

    const current = tiers.find(t => rep >= t.min && rep <= t.max) ?? tiers[1];
    const nextIdx  = tiers.indexOf(current) + 1;
    const next     = tiers[nextIdx] ?? null;

    const badgeEl = document.getElementById('reputationBadge');
    const scoreEl = document.getElementById('reputationScore');
    if (badgeEl) badgeEl.textContent = current.label;
    if (scoreEl) scoreEl.textContent = isNaN(rep) ? '0' : rep;

    const panel = document.querySelector('.reputation-summary');
    if (panel) {
        panel.classList.remove('rep-cautios','rep-novice','rep-helpful','rep-trusted','rep-guardian');
        panel.classList.add(current.className);
    }

    const barFill  = document.getElementById('repBarFill');
    const barMin   = document.getElementById('repBarMin');
    const barMax   = document.getElementById('repBarMax');
    const nextLabel = document.getElementById('repNextLabel');

    if (current.label === 'GUARDIAN' || !next) {
        if (barFill)   barFill.style.width = '100%';
        if (barMin)    barMin.textContent  = '100';
        if (barMax)    barMax.textContent  = '∞';
        if (nextLabel) nextLabel.textContent = '🏆 Max tier reached!';
    } else if (current.label === 'CAUTIOUS') {
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

    document.querySelectorAll('.rep-tier-dot').forEach(el => el.classList.remove('active'));
    const activeDot = document.querySelector(`.rep-tier-dot.${current.dotClass}`);
    if (activeDot) activeDot.classList.add('active');
}

// ─── Active Claims (no buttons — all actions in chat) ─────────────────────────
function updateClaimUi(newClaim) {
    if (newClaim.length <= 0) return;

    // Sort: active first
    const sorted = [...newClaim].sort((a, b) => statusSortKey(a.claim_status) - statusSortKey(b.claim_status));

    const container = document.getElementById('claimContainer');
    for (const claim of sorted) {
        const imagePath = claim.img_file
            ? `../img_upload/${escapeHtml(claim.img_file)}`
            : 'https://placehold.co/52x52/eef2ff/6366f1?text=?';
        const card = `
            <div id="claim_${escapeHtml(claim.claim_id)}" class="claim-row" style="cursor:pointer;" title="Open in chat" data-status="${escapeHtml(claim.claim_status)}">
                <img src="${imagePath}" class="claim-thumb" alt="${escapeHtml(claim.title)}">
                <div style="flex: 1; min-width: 0;">
                    <div class="claim-row-top">
                        <strong class="claim-item-title">${escapeHtml(claim.title)}</strong>
                        ${statusPillHtml(claim.claim_status)}
                    </div>
                    <div class="claim-row-answer">
                        Your Answer: <em>&quot;${escapeHtml(claim.answer_text)}&quot;</em>
                    </div>
                </div>
                <div class="claim-row-action-hint">Open Chat</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);

        document.getElementById(`claim_${claim.claim_id}`).addEventListener('click', function() {
            openChat(claim);
        });
    }
    applyClaimsFilter();
}

// ─── Claim Requests ─────────────────────────────────────────────────────────────
function updateClaimReqUi(newClaimReq) {
    if (newClaimReq.length <= 0) return;

    // Sort: PENDING first
    const sorted = [...newClaimReq].sort((a, b) => statusSortKey(a.claim_status) - statusSortKey(b.claim_status));

    const container = document.getElementById('claimReqContainer');
    for (const claim of sorted) {
        let item = claim.item;
        let claimer = claim.claimer;
        const imagePath = item.img_file
            ? `../img_upload/${escapeHtml(item.img_file)}`
            : 'https://placehold.co/52x52/eef2ff/6366f1?text=?';
        const isPending  = claim.claim_status === 'PENDING';

        let card = `
            <div id="claimReq_${escapeHtml(claim.claim_id)}" class="claim-row ${isPending ? 'claim-row-pending' : ''}" style="cursor:pointer;" title="Open in chat" data-status="${escapeHtml(claim.claim_status)}">
                <img src="${imagePath}" class="claim-thumb" alt="${escapeHtml(item.title)}">
                <div style="flex: 1; min-width: 0;">
                    <div class="claim-row-top">
                        <strong class="claim-item-title">${escapeHtml(claimer.username)}</strong>
                        ${statusPillHtml(claim.claim_status)}
                    </div>
                    <div class="claim-row-answer">
                        Answer: <em>&quot;${escapeHtml(claim.answer_text)}&quot;</em>
                    </div>
                </div>
                <div class="claim-row-action-hint">Open Chat</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);

        const row = document.getElementById(`claimReq_${claim.claim_id}`);
        if (row) {
            row.addEventListener('click', function() {
                openChat(claim);
            });
        }
    }
    applyClaimReqFilter();
}

function applyPostedFilter() {
    const activeBtn = document.querySelector('#postedFilterTabs .sf-tab.active');
    if (!activeBtn) return;
    const filter = activeBtn.dataset.filter;
    const rows = document.querySelectorAll('#postedItemsContainer .item-row');
    rows.forEach(row => {
        const status = row.dataset.status;
        if (filter === 'all') row.style.display = 'flex';
        else if (filter === status) row.style.display = 'flex';
        else row.style.display = 'none';
    });
}

function applyClaimsFilter() {
    const activeBtn = document.querySelector('#claimsFilterTabs .sf-tab.active');
    if (!activeBtn) return;
    const filter = activeBtn.dataset.filter;
    const rows = document.querySelectorAll('#claimContainer .claim-row');
    rows.forEach(row => {
        const status = row.dataset.status;
        if (filter === 'all') row.style.display = 'flex';
        else if (filter === status) row.style.display = 'flex';
        else row.style.display = 'none';
    });
}

function applyClaimReqFilter() {
    const activeBtn = document.querySelector('#claimReqFilterTabs .sf-tab.active');
    if (!activeBtn) return;
    const filter = activeBtn.dataset.filter;
    const rows = document.querySelectorAll('#claimReqContainer .claim-row');
    rows.forEach(row => {
        const status = row.dataset.status;
        if (filter === 'all') row.style.display = 'flex';
        else if (filter === status) row.style.display = 'flex';
        else row.style.display = 'none';
    });
}

function updateChatUi(newChat) {
    if (newChat.length <= 0) return;
}

function onClaimEdit(e) {}
function onViewClaimer(e) {}


async function openChat(claim) {
    window.location.href = `../chat.php?opening=${claim.claim_id}`;
}