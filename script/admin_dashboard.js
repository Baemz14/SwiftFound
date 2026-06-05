import * as adminUtils from "/swiftfound/script/admin_utils.js";

let reports = [];
let stats = {};
let users = [];
let currentSortKey = null;
let currentSortAsc = true;

export async function onAdminDashboardLoad() {
    reports = await adminUtils.loadNewReports();
    stats = await adminUtils.loadNewStats();
    users = await adminUtils.loadNewUsers();
    console.log(users);
    console.log(stats);
    console.log(reports);

    document.querySelectorAll('.dash-nav li').forEach(li => {
        li.addEventListener('click', () => {
            activateSection(li);
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/swiftfound/server_call/admin_call.php?call_state=ADMIN_LOGOUT', { method: 'GET' });
        window.location.href = 'admin_logout.php';
    });

    document.getElementById('reportFilterBar').addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterReports(btn.dataset.filter);
    });

    // Users search and sort controls
    document.getElementById('userSearch').addEventListener('input', e => {
        sortUsers(e.target.value);
    });

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const sortKey = e.target.dataset.sort;
            const btnText = e.target.textContent.replace(' ▲', '').replace(' ▼', '');
            
            // If clicking the same button
            if (currentSortKey === sortKey) {
                if (currentSortAsc) {
                    // First state: asc → desc
                    currentSortAsc = false;
                    e.target.textContent = btnText + ' ▼';
                    sortUsers(document.getElementById('userSearch').value, currentSortKey, currentSortAsc);
                } else {
                    // Second state: desc → deactivate
                    currentSortKey = null;
                    currentSortAsc = true;
                    e.target.classList.remove('active');
                    e.target.textContent = btnText;
                    drawUsersFromList(users.filter(u => {
                        const searchQuery = document.getElementById('userSearch').value;
                        if (!searchQuery) return true;
                        return u.username.toLowerCase().includes(searchQuery.toLowerCase());
                    }));
                }
            } else {
                // Different button clicked
                document.querySelectorAll('.sort-btn').forEach(b => {
                    b.classList.remove('active');
                    b.textContent = b.textContent.replace(' ▲', '').replace(' ▼', '');
                });
                e.target.classList.add('active');
                e.target.textContent = btnText + ' ▲';
                currentSortKey = sortKey;
                currentSortAsc = true;
                sortUsers(document.getElementById('userSearch').value, currentSortKey, currentSortAsc);
            }
        });
    });

    loadStats();
    drawReports();
    drawUsers();

    const urlParams = new URLSearchParams(window.location.search);
    let opening = urlParams.get('opening');
    if (opening) {
        const targetLi = document.querySelector(`.dash-nav li[data-section="${opening}"]`);
        if (targetLi) {
            activateSection(targetLi);
        } else {
            activateSection(document.querySelector('.dash-nav li'));
        }
    } else {
        activateSection(document.querySelector('.dash-nav li'));
    }
    setInterval(checkNewData, 2000);
}

function activateSection(li) {
    const url = new URL(window.location);
    url.searchParams.set('opening', li.dataset.section);
    window.history.pushState({}, '', url);

    document.querySelectorAll('.dash-nav li').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.dash-section').forEach(x => x.classList.remove('active'));
    li.classList.add('active');
    const sect = document.getElementById(li.dataset.section);
    if (sect) sect.classList.add('active');
    if (li.dataset.section === 'reportsSect') filterReports('ALL');
    if (li.dataset.section === 'usersSect') {
        currentSortKey = null;
        currentSortAsc = true;
        document.querySelectorAll('.sort-btn').forEach(b => {
            b.classList.remove('active');
            b.textContent = b.textContent.replace(' ▲', '').replace(' ▼', '');
        });
        document.getElementById('userSearch').value = '';
        drawUsers();
    }
}

async function checkNewData() {
    const newStats = await adminUtils.loadNewStats(stats);
    if (Object.keys(newStats).length > 0) {
        console.log("New stats:", newStats);
        for (let key in newStats) {
            stats[key] = newStats[key];
        }
        loadStats();
    }
    const newReports = await adminUtils.loadNewReports(reports);
    if (newReports.length > 0) {
        console.log("New reports:", newReports);
        reports.push(...newReports);
        drawReports();
    }
}

function esc(str) {
    if (str == null) return '—';
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function callAdmin(state, extra = {}) {
    const fd = new FormData();
    fd.append('call_state', state);
    for (const [k, v] of Object.entries(extra)) fd.append(k, v);
    const res = await fetch('/swiftfound/server_call/admin_call.php', { method: 'POST', body: fd });
    return res.json();
}

async function loadStats() {
    const s = stats;
    if (!s) return;

    // Update pending badge
    if (s.pending_reports > 0) {
        const badge = document.getElementById('pendingBadge');
        badge.textContent = s.pending_reports;
        badge.style.display = 'inline-block';
    }

    const cards = [
        { label: 'Total Users',    value: s.total_users,    icon: '👥', cls: 'purple' },
        { label: 'Total Items',    value: s.total_items,    icon: '📦', cls: 'blue' },
        { label: 'Resolved Items', value: s.resolved_items, icon: '✅', cls: 'green' },
        { label: 'Total Claims',   value: s.total_claims,   icon: '🏷️', cls: 'purple' },
        { label: 'Messages Sent',  value: s.total_messages, icon: '💬', cls: 'blue' },
        { label: 'Pending Reports',value: s.pending_reports,icon: '🚩', cls: s.pending_reports > 0 ? 'red' : 'green' },
        { label: 'Total Reports',  value: s.total_reports,  icon: '📋', cls: 'yellow' },
    ];

    document.getElementById('statsGrid').innerHTML = cards.map(c => `
        <div class="stat-card ${c.cls}">
            <div class="stat-icon">${c.icon}</div>
            <div class="stat-value">${c.value ?? 0}</div>
            <div class="stat-label">${c.label}</div>
        </div>
    `).join('');

    const breakdown = s.claim_breakdown || {};
    const bColors = { PENDING:'#fbbf24', CHATTING:'#60a5fa', OWNER_CONFIRM:'#a78bfa', RESOLVED:'#34d399', REJECTED:'#f87171', CANCELED:'#94a3b8' };
    const bLabels = { PENDING:'Pending', CHATTING:'Chatting', OWNER_CONFIRM:'Owner Confirm', RESOLVED:'Resolved', REJECTED:'Rejected', CANCELED:'Canceled' };
    document.getElementById('breakdownGrid').innerHTML = Object.entries(bLabels).map(([k, label]) => `
        <div class="breakdown-pill" style="border-color:${bColors[k]}22; color:${bColors[k]};">
            <span class="pill-count">${breakdown[k] ?? 0}</span> ${label}
        </div>
    `).join('');
}

function drawReports() {
    const container = document.getElementById('reportList');
    container.innerHTML = '<div class="loading-text">Loading…</div>';

    if (reports.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎉</div>No reports found.</div>`;
        return;
    }

    const statusOrder = { PENDING: 0, ACCEPTED: 1, DISMISSED: 2 };
    const sortedReports = [...reports].sort((a, b) => {
        const aOrder = statusOrder[(a.status || '').toUpperCase()] ?? 3;
        const bOrder = statusOrder[(b.status || '').toUpperCase()] ?? 3;
        return aOrder - bOrder;
    });

    container.innerHTML = `
        <div class="reports-list">
            ${sortedReports.map((r, idx) => {
                const detailsText = r.details ? esc(r.details) : 'No extra details provided.';
                const date = new Date(r.created_at).toLocaleDateString('en-MY', { month:'short', day:'numeric', year:'numeric' });
                const time = new Date(r.created_at).toLocaleTimeString('en-MY', { hour:'2-digit', minute:'2-digit' });

                return `
                    <div class="report-card" id="rcard_${r.report_id}">
                        <div class="report-card-main" onclick="this.closest('.report-card').classList.toggle('expanded')">
                            <div class="report-main-info">
                                <div class="report-header-row">
                                    <span class="report-label">Reporter:</span>
                                    <span class="report-name">${esc(r.reporter_name)}</span>
                                </div>
                                <div class="report-header-row">
                                    <span class="report-label">Target:</span>
                                    <span class="report-target">
                                        ${r.reported_item_title ? `<span class="target-item">📦 ${esc(r.reported_item_title)}</span>` : ''}
                                        ${r.reported_username ? `<span class="target-user">👤 ${esc(r.reported_username)}</span>` : ''}
                                    </span>
                                </div>
                                <div class="report-header-row">
                                    <span class="report-label">Reason:</span>
                                    <span class="report-reason">${esc(r.reason)}</span>
                                </div>
                            </div>
                            <div class="report-main-meta">
                                <span class="r-badge ${r.status}">${r.status}</span>
                                <span class="report-date">${date}</span>
                            </div>
                            <div class="expand-icon">›</div>
                        </div>
                        <div class="report-card-details">
                            <div class="report-details-section">
                                <div class="details-title">Detailed Information</div>
                                <div class="details-row">
                                    <div class="detail-item">
                                        <span class="detail-label">Reporter</span>
                                        <span class="detail-value">${esc(r.reporter_name)}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Reported User</span>
                                        <span class="detail-value">${esc(r.reported_username) || '—'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Reported Item</span>
                                        <span class="detail-value">${esc(r.reported_item_title) || '—'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Item Status</span>
                                        <span class="detail-value">${esc(r.item_status)}</span>
                                    </div>
                                </div>
                                <div class="detail-full-width">
                                    <span class="detail-label">Details</span>
                                    <div class="detail-text">${detailsText}</div>
                                </div>
                                ${r.admin_note ? `
                                    <div class="detail-full-width">
                                        <span class="detail-label">Admin Note</span>
                                        <div class="detail-text admin-note">${esc(r.admin_note)}</div>
                                    </div>
                                ` : ''}
                                <div class="detail-full-width">
                                    <span class="detail-label">Dates</span>
                                    <div class="detail-dates">
                                        <span>Reported: ${date} at ${time}</span>
                                    </div>
                                </div>
                                ${r.status === 'PENDING' ? `
                                <div>
                                    <button id='reviewBtn_${r.report_id}' type='button' class='r-btn review-action-btn'>review item</button>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    for (const r of reports) {
        let reviewBtn = document.getElementById(`reviewBtn_${r.report_id}`);
        if (reviewBtn) {
            reviewBtn.addEventListener('click', function (e) {
                window.location.href = `/swiftfound/item_detail.php?item_id=${r.reported_item_id}&report_id=${r.report_id}`;
            });
        }

    }
}

function filterReports(filter) {
    for (const r of reports) {
        if (filter !== 'ALL' && r.status !== filter) {
            document.getElementById(`rcard_${r.report_id}`).style.display = 'none';
        } else {
            document.getElementById(`rcard_${r.report_id}`).style.display = 'block';
        }
    }
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active')
        if (b.dataset.filter === filter) b.classList.add('active');
    });
}

function sortUsers(searchQuery = '', sortKey = null, ascending = true) {
    let filtered = users.filter(u => {
        if (!searchQuery) return true;
        return u.username.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (sortKey) {
        filtered.sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];
            
            // Handle numeric values
            if (typeof aVal === 'string' && !isNaN(aVal)) {
                aVal = parseInt(aVal);
                bVal = parseInt(bVal);
            }
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }

    // Update the users display
    const container = document.getElementById('usersContainer');
    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div>No users found.</div>`;
        return;
    }

    drawUsersFromList(filtered);
}

function drawUsersFromList(userList) {
    const container = document.getElementById('usersContainer');

    const claimStatusColors = { 
        PENDING: '#fbbf24', 
        CHATTING: '#60a5fa', 
        OWNER_CONFIRM: '#a78bfa', 
        RESOLVED: '#34d399', 
        REJECTED: '#f87171', 
        CANCELED: '#94a3b8' 
    };
    const claimStatusLabels = { 
        PENDING: 'Pending', 
        CHATTING: 'Chatting', 
        OWNER_CONFIRM: 'Owner Confirm', 
        RESOLVED: 'Resolved', 
        REJECTED: 'Rejected', 
        CANCELED: 'Canceled' 
    };

    container.innerHTML = `
        <div class="users-list">
            ${userList.map((u, idx) => `
                <div class="user-card" id="ucard_${idx}">
                    <div class="user-card-main" onclick="this.closest('.user-card').classList.toggle('expanded')">
                        <div class="user-main-info">
                            <div class="user-id" style="color:#94a3b8;">#${esc(u.user_id)}</div>
                            <div class="user-username">${esc(u.username)}</div>
                        </div>
                        <div class="user-main-stats">
                            <div class="user-stat">
                                <span class="stat-label">Reputation</span>
                                <span class="stat-value" style="color:${u.reputation < 0 ? '#f87171' : '#fbbf24'};">★ ${esc(u.reputation)}</span>
                            </div>
                            <div class="user-stat">
                                <span class="stat-label">Items</span>
                                <span class="stat-value">${esc(u.item_count)}</span>
                            </div>
                            <div class="user-stat">
                                <span class="stat-label">Total Claims</span>
                                <span class="stat-value">${esc(u.claim_count)}</span>
                            </div>
                        </div>
                        <div class="expand-icon">›</div>
                    </div>
                    <div class="user-card-details">
                        <div class="claims-breakdown">
                            <div class="breakdown-title">Claim Status Breakdown</div>
                            <div class="breakdown-items">
                                ${Object.entries(claimStatusLabels).map(([key, label]) => {
                                    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '').replace('owner_confirm', 'owner_confirmed').replace('pending_resolution', 'pending_resolution');
                                    const countKey = key === 'OWNER_CONFIRM' ? 'owner_confirmed_claims' : key === 'PENDING' ? 'pending_claims' : key.toLowerCase() + '_claims';
                                    const count = u[countKey] || '0';
                                    return `
                                        <div class="breakdown-item">
                                            <div class="breakdown-dot" style="background:${claimStatusColors[key]};"></div>
                                            <span class="breakdown-label">${label}</span>
                                            <span class="breakdown-count" style="color:${claimStatusColors[key]};">${count}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function drawUsers() {
    const container = document.getElementById('usersContainer');
    container.innerHTML = '<div class="loading-text">Loading…</div>';

    if (users.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div>No users found.</div>`;
        return;
    }

    drawUsersFromList(users);
}

function updateUser(user) {

}