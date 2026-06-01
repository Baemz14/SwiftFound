<?php
session_start();
if (!isset($_SESSION['admin_auth']) || !$_SESSION['admin_auth']) {
    header("Location: admin.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/admin_dashboard.css">
</head>
<body>
<div class="dash-layout">

    <!-- Sidebar -->
    <nav class="dash-sidebar">
        <div class="dash-logo">SwiftFound</div>
        <div class="dash-logo-sub">Admin Panel</div>

        <ul class="dash-nav">
            <li class="active" data-section="statsSect">
                <span class="dash-nav-icon">📊</span> Statistics
            </li>
            <li data-section="reportsSect">
                <span class="dash-nav-icon">🚩</span> User Reports
                <span id="pendingBadge" style="margin-left:auto; display:none;"></span>
            </li>
            <li data-section="usersSect">
                <span class="dash-nav-icon">👥</span> Users
            </li>
        </ul>

        <div class="dash-sidebar-bottom">
            <a href="admin.php?logout=1" class="dash-logout" id="logoutBtn">← Logout</a>
        </div>
    </nav>

    <!-- Main -->
    <main class="dash-main">

        <!-- Statistics Section -->
        <div id="statsSect" class="dash-section active">
            <h1 class="dash-section-title">Platform Statistics</h1>
            <p class="dash-section-sub">Live overview of SwiftFound activity.</p>

            <div class="stats-grid" id="statsGrid">
                <div class="loading-text">Loading stats…</div>
            </div>

            <p class="sub-heading">Claim Status Breakdown</p>
            <div class="breakdown-grid" id="breakdownGrid">
                <div class="loading-text">Loading…</div>
            </div>
        </div>

        <!-- Reports Section -->
        <div id="reportsSect" class="dash-section">
            <h1 class="dash-section-title">User Reports</h1>
            <p class="dash-section-sub">Review and resolve platform reports.</p>

            <div class="filter-bar" id="reportFilterBar">
                <button class="filter-btn active" data-filter="ALL">All</button>
                <button class="filter-btn" data-filter="PENDING">Pending</button>
                <button class="filter-btn" data-filter="REVIEWING">Reviewing</button>
                <button class="filter-btn" data-filter="RESOLVED">Resolved</button>
                <button class="filter-btn" data-filter="DISMISSED">Dismissed</button>
            </div>

            <div class="report-list" id="reportList">
                <div class="loading-text">Loading reports…</div>
            </div>
        </div>

        <!-- Users Section -->
        <div id="usersSect" class="dash-section">
            <h1 class="dash-section-title">Users</h1>
            <p class="dash-section-sub">All registered platform members.</p>
            <div id="usersContainer">
                <div class="loading-text">Loading users…</div>
            </div>
        </div>

    </main>
</div>

<!-- Action Modal -->
<div id="actionModal" class="dash-modal-overlay" style="display:none;">
    <div class="dash-modal-card">
        <h3 id="modalTitle">Update Report</h3>
        <p style="font-size:0.85rem; color:#94a3b8; margin:0 0 12px 0;" id="modalSub"></p>
        <textarea id="modalNote" placeholder="Admin note (optional)…"></textarea>
        <div class="dash-modal-actions">
            <button class="dm-btn dm-btn-cancel" id="modalCancel">Cancel</button>
            <button class="dm-btn dm-btn-dismiss" id="modalDismiss">Dismiss</button>
            <button class="dm-btn dm-btn-resolve" id="modalResolve">✓ Resolve</button>
        </div>
    </div>
</div>

<script>
// ── helpers ──────────────────────────────────────────────────────────────────
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

// ── Sidebar nav ───────────────────────────────────────────────────────────────
document.querySelectorAll('.dash-nav li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelectorAll('.dash-nav li').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('.dash-section').forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        const sect = document.getElementById(li.dataset.section);
        if (sect) sect.classList.add('active');
        if (li.dataset.section === 'reportsSect') loadReports('ALL');
        if (li.dataset.section === 'usersSect') loadUsers();
    });
});

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/swiftfound/server_call/admin_call.php?call_state=ADMIN_LOGOUT', { method: 'GET' });
    // Just clear session by redirecting to admin.php logout handler
    window.location.href = 'admin_logout.php';
});

// ── Stats ─────────────────────────────────────────────────────────────────────
async function loadStats() {
    const data = await callAdmin('GET_STATS');
    const s = data.stats;
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

// ── Reports ───────────────────────────────────────────────────────────────────
let currentFilter = 'ALL';

document.getElementById('reportFilterBar').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    loadReports(currentFilter);
});

async function loadReports(filter) {
    const container = document.getElementById('reportList');
    container.innerHTML = '<div class="loading-text">Loading…</div>';
    const data = await callAdmin('GET_REPORTS', { status_filter: filter });
    const reports = data.reports || [];

    if (reports.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎉</div>No reports found.</div>`;
        return;
    }

    container.innerHTML = reports.map(r => {
        const target = r.reported_username
            ? `User: <strong>${esc(r.reported_username)}</strong>`
            : r.reported_item_title
                ? `Item: <strong>${esc(r.reported_item_title)}</strong>`
                : '<span>Unknown target</span>';

        const date = new Date(r.created_at).toLocaleDateString('en-MY', { month:'short', day:'numeric', year:'numeric' });

        let actionBtns = '';
        if (r.status === 'PENDING') {
            actionBtns = `
                <button class="r-btn review" onclick="setReview(${r.report_id})">👁 Review</button>
                <button class="r-btn resolve" onclick="openActionModal(${r.report_id}, '${esc(r.reporter_name)}', '${esc(r.reason)}')">Resolve / Dismiss</button>
            `;
        } else if (r.status === 'REVIEWING') {
            actionBtns = `<button class="r-btn resolve" onclick="openActionModal(${r.report_id}, '${esc(r.reporter_name)}', '${esc(r.reason)}')">Resolve / Dismiss</button>`;
        }

        return `
            <div class="report-card" id="rcard_${r.report_id}">
                <div class="report-card-top">
                    <div class="report-meta">
                        <div class="report-target">${target} <span>by ${esc(r.reporter_name)}</span></div>
                        <div class="report-reason">"${esc(r.reason)}"</div>
                        ${r.admin_note ? `<div style="font-size:0.8rem;color:#60a5fa;">Admin note: ${esc(r.admin_note)}</div>` : ''}
                        <div class="report-footer">
                            <span class="r-badge ${r.status}">${r.status}</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="report-actions">${actionBtns}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function setReview(reportId) {
    await callAdmin('UPDATE_REPORT', { report_id: reportId, status: 'REVIEWING', admin_note: '' });
    loadReports(currentFilter);
}

// ── Action modal ──────────────────────────────────────────────────────────────
let _modalReportId = null;

function openActionModal(reportId, reporterName, reason) {
    _modalReportId = reportId;
    document.getElementById('modalTitle').textContent = 'Resolve or Dismiss Report';
    document.getElementById('modalSub').textContent = `Reporter: ${reporterName}  •  "${reason}"`;
    document.getElementById('modalNote').value = '';
    document.getElementById('actionModal').style.display = 'flex';
}

document.getElementById('modalCancel').addEventListener('click', () => {
    document.getElementById('actionModal').style.display = 'none';
    _modalReportId = null;
});

document.getElementById('modalResolve').addEventListener('click', async () => {
    if (!_modalReportId) return;
    const note = document.getElementById('modalNote').value.trim();
    await callAdmin('UPDATE_REPORT', { report_id: _modalReportId, status: 'RESOLVED', admin_note: note });
    document.getElementById('actionModal').style.display = 'none';
    _modalReportId = null;
    loadReports(currentFilter);
    loadStats();
});

document.getElementById('modalDismiss').addEventListener('click', async () => {
    if (!_modalReportId) return;
    const note = document.getElementById('modalNote').value.trim();
    await callAdmin('UPDATE_REPORT', { report_id: _modalReportId, status: 'DISMISSED', admin_note: note });
    document.getElementById('actionModal').style.display = 'none';
    _modalReportId = null;
    loadReports(currentFilter);
    loadStats();
});

// ── Users ─────────────────────────────────────────────────────────────────────
async function loadUsers() {
    const container = document.getElementById('usersContainer');
    container.innerHTML = '<div class="loading-text">Loading…</div>';
    const data = await callAdmin('GET_USERS');
    const users = data.users || [];

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

// ── Init ──────────────────────────────────────────────────────────────────────
loadStats();
</script>
</body>
</html>
