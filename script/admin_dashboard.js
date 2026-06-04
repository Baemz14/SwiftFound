import * as adminUtils from "/swiftfound/script/admin_utils.js";

let currentFilter = 'ALL';
let _modalReportId = null;

let reports = [];
let stats = {};
let users = [];

export async function onAdminDashboardLoad() {
    reports = await adminUtils.loadNewReports();
    stats = await adminUtils.loadNewStats();
    users = await adminUtils.loadNewUsers();
    console.log(users);

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

    loadStats();
    drawReports();
    drawUsers();
    setInterval(checkNewData, 2000);
}

function activateSection(li) {
    document.querySelectorAll('.dash-nav li').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.dash-section').forEach(x => x.classList.remove('active'));
    li.classList.add('active');
    const sect = document.getElementById(li.dataset.section);
    if (sect) sect.classList.add('active');
    if (li.dataset.section === 'reportsSect') filterReports('ALL');
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

    container.innerHTML = reports.map(r => {
        const detailsText = r.details ? esc(r.details) : 'No extra details provided.';
        const targetLabel = r.reported_item_title ? esc(r.reported_item_title) : esc(r.reported_username) || 'Unknown target';
        const targetType = r.reported_item_title ? 'Item' : r.reported_username ? 'User' : 'Target';
        const date = new Date(r.created_at).toLocaleDateString('en-MY', { month:'short', day:'numeric', year:'numeric' });

        return `
            <div class="report-card" id="rcard_${r.report_id}">
                <div class="report-card-header">
                    <div class="report-card-title">
                        <div class="report-source">${esc(r.reporter_name)}</div>
                        <div class="report-subtitle">${targetType}: <span>${targetLabel}</span></div>
                    </div>
                    <span class="r-badge ${r.status}">${r.status}</span>
                </div>
                <div class="report-card-content">
                    <div class="report-line">
                        <div class="report-field">Reason</div>
                        <div class="report-value">${esc(r.reason)}</div>
                    </div>
                    <div class="report-line report-details">
                        <div class="report-field">Details</div>
                        <div class="report-value">${detailsText}</div>
                    </div>
                </div>
                <div class="report-card-footer">
                    <span>${date}</span>
                </div>
            </div>
        `;
    }).join('');
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

function drawUsers() {
    const container = document.getElementById('usersContainer');
    container.innerHTML = '<div class="loading-text">Loading…</div>';

    if (users.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div>No users found.</div>`;
        return;
    }

    container.innerHTML = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Reputation</th>
                    <th>Items Posted</th>
                    <th>Claims Made</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(u => `
                    <tr>
                        <td style="color:#94a3b8;">#${esc(u.user_id)}</td>
                        <td class="username-cell">${esc(u.username)}</td>
                        <td class="rep-cell">★ ${esc(u.reputation)}</td>
                        <td>${esc(u.item_count)}</td>
                        <td>${esc(u.claim_count)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateUser(user) {

}