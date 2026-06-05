import { callServer } from "/swiftfound/include/call_server.js";
import { CategoryEnumDB, CategoryText, CategoryEnum } from "/swiftfound/enum_constant.js";

let allItems = [];
let user = null;

export async function onBrowseLoad() {
    // Load session / user data
    let sessData = await callServer('/swiftfound/server_call/user_call.php', null, "GET_SESSDATA");
    user = sessData['user'];

    // ── Nav: update in JS as a fallback/enhancement (PHP already handles it) ──
    // (Nothing extra needed — PHP rendered the correct state server-side.)

    // ── Load all items ─────────────────────────────────────────────────────────
    let resp = await callServer("/swiftfound/server_call/item_call.php", null, "ALL_ITEMS");
    allItems = resp['items'] || [];

    const listingsWrapper = document.getElementById("listings_wrapper");
    for (const item of allItems) {
        drawItemCard(item);
    }

    // ── Populate category dropdown ─────────────────────────────────────────────
    const categoryFilter = document.getElementById("categoryFilter");
    for (let i = 0; i < CategoryText.length; i++) {
        categoryFilter.insertAdjacentHTML('beforeend',
            `<option value="${CategoryEnumDB[i]}">${capitalise(CategoryText[i])}</option>`
        );
    }

    // ── Filter elements ────────────────────────────────────────────────────────
    const searchInput         = document.getElementById('searchInput');
    const locationFilter      = document.getElementById('locationFilter');
    const dateFrom            = document.getElementById('dateFrom');
    const dateTo              = document.getElementById('dateTo');
    const showResolvedCb      = document.getElementById('showResolved');
    const showAbandonedCb     = document.getElementById('showAbandoned');
    const showOwnerConfirmCb  = document.getElementById('showOwnerConfirm');

    // ── Filter function ────────────────────────────────────────────────────────
    function filterItems() {
        const searchQ    = searchInput.value.trim().toLowerCase();
        const selCat     = categoryFilter.value;
        const locQ       = locationFilter.value.trim().toLowerCase();
        const fromDate   = dateFrom.value ? new Date(dateFrom.value) : null;
        const toDate     = dateTo.value   ? new Date(dateTo.value + 'T23:59:59') : null;
        const showRes    = showResolvedCb?.checked;
        const showAban   = showAbandonedCb?.checked;
        const showOC     = showOwnerConfirmCb?.checked;

        const cards = document.querySelectorAll('.item-card');
        cards.forEach(card => {
            const status   = card.dataset.status || 'AVAILABLE';
            const cat      = card.dataset.category || '';
            const title    = (card.dataset.title || '').toLowerCase();
            const loc      = (card.dataset.location || '').toLowerCase();
            const poster   = (card.dataset.poster || '').toLowerCase();
            const cardDate = card.dataset.date ? new Date(card.dataset.date) : null;

            // Always hide REMOVED
            if (status === 'REMOVED') { card.style.display = 'none'; return; }

            // Hidden-by-default statuses — only show when checkbox is ticked
            if (status === 'RESOLVED'      && !showRes)  { card.style.display = 'none'; return; }
            if (status === 'ABANDONED'     && !showAban) { card.style.display = 'none'; return; }
            if (status === 'OWNER_CONFIRM' && !showOC)   { card.style.display = 'none'; return; }

            // Category
            if (selCat && cat !== selCat) { card.style.display = 'none'; return; }

            // Search (title, location, poster)
            if (searchQ && !title.includes(searchQ) && !loc.includes(searchQ) && !poster.includes(searchQ)) {
                card.style.display = 'none'; return;
            }

            // Location
            if (locQ && !loc.includes(locQ)) { card.style.display = 'none'; return; }

            // Date range
            if (cardDate) {
                if (fromDate && cardDate < fromDate) { card.style.display = 'none'; return; }
                if (toDate   && cardDate > toDate)   { card.style.display = 'none'; return; }
            }

            card.style.display = '';
        });
    }

    // Attach all filter listeners
    [searchInput, locationFilter, dateFrom, dateTo].forEach(el => {
        if (el) el.addEventListener('input', filterItems);
    });
    [categoryFilter, showResolvedCb, showAbandonedCb, showOwnerConfirmCb].forEach(el => {
        if (el) el.addEventListener('change', filterItems);
    });

    // Run immediately to hide RESOLVED/ABANDONED/OWNER_CONFIRM on load
    filterItems();
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Status pill config (same palette as home.css)
const STATUS_PILL = {
    AVAILABLE:     { label: 'Available',     cls: 'sp-available'     },
    LOST:          { label: 'Lost',          cls: 'sp-lost'          },
    OWNER_CONFIRM: { label: 'Owner Confirm', cls: 'sp-owner-confirm' },
    RESOLVED:      { label: 'Resolved',      cls: 'sp-resolved'      },
    ABANDONED:     { label: 'Abandoned',     cls: 'sp-abandoned'     },
    CLAIMED:       { label: 'Claimed',       cls: 'sp-claimed'       },
};

function statusPill(status) {
    const cfg = STATUS_PILL[status];
    if (!cfg) return '';
    return `<span class="status-pill ${cfg.cls}">${cfg.label}</span>`;
}

// ── Draw one item card ─────────────────────────────────────────────────────────
function drawItemCard(item) {
    const listingsWrapper = document.getElementById("listings_wrapper");
    if (item['status'] === 'REMOVED') return;

    const isUserPosted = user && item['user_id'] === user['user_id'];
    const status  = item['status'] || 'AVAILABLE';
    const catIdx  = CategoryEnum[item['category']];
    const catText = catIdx !== undefined ? capitalise(CategoryText[catIdx]) : escHtml(item['category']);
    const imgSrc  = item['img_file']
        ? `/swiftfound/img_upload/${escHtml(item['img_file'])}`
        : 'https://placehold.co/300x180/eef2ff/6366f1?text=No+Image';

    const dateStr = item.created_at
        ? new Date(item.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    // Only show pill if NOT the default available/active state
    const showPill = status !== 'AVAILABLE' && status !== 'LOST';

    const card = `
        <div id="itemCard_${escHtml(item.item_id)}"
             class="item-card"
             data-category="${escHtml(item['category'])}"
             data-status="${escHtml(status)}"
             data-title="${escHtml(item['title'])}"
             data-location="${escHtml(item['location'])}"
             data-poster="${escHtml(item['username'])}"
             data-date="${escHtml(item['created_at'] || '')}">
            <div class="item-card-img">
                <img src="${imgSrc}" alt="${escHtml(item['title'])}" loading="lazy">
                ${showPill ? `<div class="card-status-overlay">${statusPill(status)}</div>` : ''}
            </div>
            <div class="card-info">
                <div class="card-header">
                    <span class="category-tag">${catText}</span>
                    ${!showPill ? statusPill(status) : ''}
                </div>
                <h3 title="${escHtml(item['title'])}">${escHtml(item['title'])}</h3>
                <div class="card-meta">
                    <span class="card-location">${escHtml(item['location']) || '—'}</span>
                </div>
                <div class="posted-by">
                    By <strong>${isUserPosted ? 'You' : escHtml(item['username'])}</strong>
                </div>
                <div class="posted-at">${dateStr}</div>
            </div>
        </div>
    `;
    listingsWrapper.insertAdjacentHTML('beforeend', card);
    document.getElementById(`itemCard_${item.item_id}`).addEventListener('click', function () {
        window.location.href = `item_detail.php?item_id=${item.item_id}`;
    });
}