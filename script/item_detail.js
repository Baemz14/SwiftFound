import { callServer } from "../include/call_server.js";
import { CategoryEnumDB, CategoryText, CategoryEnum } from "../enum_constant.js";
import { checkIsLoggedIn } from "user_utils.js";
import * as userUtils from "user_utils.js";
import * as adminUtils from "admin_utils.js";

let item = null;
let user = null;
let claims = null;

let userClaim = null;
let claimAttempt = 0;
let userClaimBlocked = false; // true when user exceeded allowed attempts
let isArchived = false;
let viewingStatus = 'USER_VIEW'; // USER_VIEW, USER_POSTED, USER_CLAIMED, ADMIN_REVIEW
let report = null;

export async function onItemLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    let reportId = urlParams.get('report_id');
    if (reportId) {
        report = await adminUtils.getReport(reportId);
        if (report) {
            viewingStatus = 'ADMIN_REVIEW';
        }
        console.log(report);
    }

    if (viewingStatus === 'ADMIN_REVIEW') {
        const backLink = document.querySelector('.back-link');
        if (backLink) {
            backLink.setAttribute('href', '../admin_dashboard.php');
            backLink.innerText = '← Back to Admin Dashboard';
        }
    }

    let formData = new FormData();
    formData.append('item_id', urlParams.get('item_id'));
    let data = await callServer('../server_call/item_call.php', formData, "GET_ITEM");
    item = data['item'];
    if (!item) {
        alert(`cant find item`);
        window.location.href = "../browse.php";
    }
    console.log(item);

    if (viewingStatus !== 'ADMIN_REVIEW') {        
        let sessData = await callServer('../server_call/user_call.php', null, "GET_SESSDATA");
        user = sessData['user'];
        if (user) {
            viewingStatus = item['user_id'] === user['user_id']? 'USER_POSTED': 'USER_VIEW';
        }
    }

    await loadClaims();
    displayClaimStatistics();
    renderItemStatus();

    document.getElementById('item_image').src = `../img_upload/${item['img_file']}`;
    document.getElementById('category').innerText = CategoryText[CategoryEnum[item['category']]];
    document.getElementById('title').innerText = item['title'];
    document.getElementById('question').innerText = item['secret_question'];

    const dateObj = new Date(item['created_at']);
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);
    document.getElementById('detail_date').innerText = `${formattedDate}, ${formattedTime}`;

    document.getElementById('loc').innerText = item['location'];
    document.getElementById('desc').innerText = item['description'];
    document.getElementById('username').innerText = viewingStatus === 'USER_POSTED'? "you": item['username'];

    const reputationContainer = document.getElementById('posterReputation');
    const reputationBadge = document.getElementById('repBadge');
    const reputationValue = Number(item['reputation'] ?? 0);
    const repLabel = getReputationLabel(reputationValue);
    const reputationLabel = repLabel.label;
    const reputationClass = repLabel.className;
    const repElement = document.getElementById('rep');
    if (repElement) {
        repElement.innerText = Number.isNaN(reputationValue) ? '0' : reputationValue;
    }
    if (reputationBadge) {
        reputationBadge.innerText = reputationLabel;
    }
    if (reputationContainer) {
        reputationContainer.classList.remove('rep-cautios', 'rep-novice', 'rep-helpful', 'rep-trusted', 'rep-guardian');
        reputationContainer.classList.add(reputationClass);
    }

    updateButtonVisibility();
    renderAdminReportStatus();

    document.getElementById('claimBtn').addEventListener('click', onClaimClick);
    document.getElementById('reportBtn').addEventListener('click', function(e) {
        if (!user) {
            alert("You must be logged in to report an item");
            return;
        }
        document.getElementById('reportModal').style.display = 'flex';
    });
    document.getElementById('deleteBtn').addEventListener('click', function(e) {
        document.getElementById('deleteModal').style.display = 'flex';
    });
    document.getElementById('removeItemBtn').addEventListener('click', function() {
        document.getElementById('removeItemModal').style.display = 'flex';
    });
    document.getElementById('dismissReportBtn').addEventListener('click', function() {
        document.getElementById('dismissReportModal').style.display = 'flex';
    });
    document.getElementById('cancelReportBtn').addEventListener('click', closeReportModal);
    document.getElementById('submitReportBtn').addEventListener('click', submitReport);

    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', abandonItem);

    document.getElementById('cancelClaimBtn').addEventListener('click', closeClaimModal);
    document.getElementById('submitClaimBtn').addEventListener('click', claimItem);
    document.getElementById('cancelRemoveItemBtn').addEventListener('click', closeRemoveItemModal);
    document.getElementById('confirmRemoveItemBtn').addEventListener('click', onConfirmRemoveItem);
    document.getElementById('cancelDismissReportBtn').addEventListener('click', closeDismissReportModal);
    document.getElementById('confirmDismissReportBtn').addEventListener('click', onConfirmDismissReport);
    document.getElementById('adminResultOkBtn').addEventListener('click', closeAdminResultModal);

    // open chat button listener (if applicable)
    if (user && viewingStatus === 'USER_CLAIMED') {
        document.getElementById('openChatBtn').addEventListener('click', function() {
            window.location.href = `../chat.php?opening=${userClaim['claim_id']}`;
        });
    }

    console.log(viewingStatus);
}

function getRawItemStatus() {
    if (!item) return '';
    return (item['status'] || item.status || item['claim_status'] || item.claim_status || '').toString().toUpperCase();
}

function getStatusDisplay(rawStatus) {
    if (!rawStatus) return '';
    if (rawStatus === 'OWNER_CONFIRM') return 'Owner Confirmed';
    if (rawStatus === 'REMOVED') return 'Removed';
    if (rawStatus === 'RESOLVED') return 'Resolved';
    if (rawStatus === 'ABANDONED') return 'Abandoned';
    return rawStatus.split('_').map(s => s.charAt(0) + s.slice(1).toLowerCase()).join(' ');
}

function renderItemStatus() {
    const statusEl = document.getElementById('itemStatus');
    if (!statusEl) return;

    const rawStatus = getRawItemStatus();
    isArchived = rawStatus && rawStatus !== 'PENDING';
    if (!rawStatus || rawStatus === 'PENDING') {
        statusEl.style.display = 'none';
        return;
    }

    statusEl.innerText = getStatusDisplay(rawStatus);
    statusEl.className = 'item-status status-' + rawStatus.toLowerCase();
    statusEl.style.display = 'inline-flex';
}

function renderAdminReportStatus() {
    const adminStatusEl = document.getElementById('adminReportStatus');
    if (!adminStatusEl) return;
    if (viewingStatus !== 'ADMIN_REVIEW' || !report) {
        adminStatusEl.style.display = 'none';
        return;
    }

    const rawReportStatus = (report.status || report.report_status || '').toString().toUpperCase();
    const displayReportStatus = rawReportStatus ? rawReportStatus.split('_').map(s => s.charAt(0) + s.slice(1).toLowerCase()).join(' ') : 'Unknown';
    adminStatusEl.innerText = `Report status: ${displayReportStatus}`;
    adminStatusEl.style.display = 'block';
}

async function loadClaims() {
    claimAttempt = 0;
    userClaim = null;
    userClaimBlocked = false;

    claims = await userUtils.itemClaims(item['item_id']);
    for (let claim of claims) {
        if (user && claim['user_id'] === user['user_id']) {
            const status = (claim['claim_status'] || '').toString().toUpperCase();
            // treat rejected/canceled/abandoned as failed attempts
            if (status === 'REJECTED' || status === 'CANCELED' || status === 'ABANDONED') {
                claimAttempt++;
                // if exceeded attempts, block further claims
                if (claimAttempt >= 3) {
                    userClaimBlocked = true;
                }
                continue;
            }

            // active claim statuses
            if (status === 'PENDING' || status === 'CHATTING' || status === 'OWNER_CONFIRM') {
                viewingStatus = 'USER_CLAIMED'
                userClaim = claim;
                break;
            }
        }
    }
    console.log(userClaim);

    // update UI messaging about user's claim attempts / active claim
    const alreadyMsgEl = document.getElementById('alreadyClaimedMsg');
    const attemptBadge = document.getElementById('claimAttemptBadge');
    if (viewingStatus === 'USER_CLAIMED') {
        let msg = 'You have an active claim.';
        if (claimAttempt > 0) {
            msg += ` You also have ${claimAttempt} previous attempt${claimAttempt !== 1 ? 's' : ''}.`;
        }
        alreadyMsgEl.innerText = msg;
    } else if (userClaimBlocked) {
        alreadyMsgEl.innerText = `You have reached the maximum of 3 claim attempts.`;
    } else if (claimAttempt > 0) {
        alreadyMsgEl.innerText = `You have ${claimAttempt} previous claim attempt${claimAttempt !== 1 ? 's' : ''}.`;
    } else {
        alreadyMsgEl.innerText = '';
    }

    if (claimAttempt > 0) {
        attemptBadge.innerText = `${claimAttempt} / 3 attempts`;
        attemptBadge.style.display = 'inline-block';
    } else {
        attemptBadge.style.display = 'none';
    }

    if (alreadyMsgEl.innerText) {
        alreadyMsgEl.style.display = 'block';
    } else {
        alreadyMsgEl.style.display = 'none';
    }
}


function onClaimClick(e) {
    if (viewingStatus === 'USER_POSTED') {
        alert(`cannot claim your own stuff >:(`);
        return;
    }
    if (!user) {
        alert(`you no login go login`);
        window.location.href = "../login.php";
        return;
    }
    if (viewingStatus === 'USER_CLAIMED') {
        alert(`You have an active claim for this item.`);
        return;
    }
    if (userClaimBlocked) {
        alert(`You have reached the maximum number of claim attempts and cannot claim this item.`);
        return;
    }
    if (isArchived) {
        alert(`This item is archived and cannot be claimed.`);
        return;
    }
    document.getElementById('claimModal').style.display = 'flex';
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

async function claimItem(e) {
    e.preventDefault();
    let answer = document.getElementById('answer').value;
    if (answer === "") {
        alert(`plis give your answer`);
        return;
    }
    let isClaimed = await userUtils.claimItem(item['item_id'], item.user_id, user.user_id, item.secret_question, answer);
    if (isClaimed) {
        await loadClaims();
        closeClaimModal();
        document.getElementById('successModal').style.display = "";
        document.getElementById('btnOk').addEventListener('click', function() {
            document.getElementById('successModal').style.display = "none";
            window.location.href = `../chat.php?opening=${userClaim['claim_id']}`;
        });
    } else {
        alert(`something went wong`);
        console.log(`something went wong: ${data['error_log']}`);
    }
}

function closeClaimModal(e) {
    document.getElementById('claimModal').style.display = 'none';
    document.getElementById('answer').value = "";
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    document.getElementById('reportReason').value = '';
    document.getElementById('reportDetails').value = '';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

async function submitReport() {
    const reason = document.getElementById('reportReason').value;
    const details = document.getElementById('reportDetails').value;

    if (!reason) {
        alert('Please select a reason for reporting');
        return;
    } if (!user) {
        alert('You must be logged in to report an item');
        return;
    }
    let isReported = await userUtils.reportItem(item, reason, details);
    // TODO: alert change to dialog box
    if (isReported) {
        alert('Report submitted successfully');
        closeReportModal();
    } else {
        alert('Failed to submit report');
    }
}

function updateButtonVisibility() {
    const claimBtn = document.getElementById('claimBtn');
    const reportBtn = document.getElementById('reportBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const removeItemBtn = document.getElementById('removeItemBtn');
    const dismissReportBtn = document.getElementById('dismissReportBtn');
    const chatBtn = document.getElementById('openChatBtn');
    const alreadyClaimedMsg = document.getElementById('alreadyClaimedMsg');
    const adminStatusEl = document.getElementById('adminReportStatus');
    const restrictedMsg = document.getElementById('restrictedMsg');

    if (adminStatusEl) {
        adminStatusEl.style.display = 'none';
    }

    if (user && user.is_restricted == 1) {
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        removeItemBtn.style.display = 'none';
        dismissReportBtn.style.display = 'none';
        chatBtn.style.display = 'none';
        alreadyClaimedMsg.style.display = 'none';
        restrictedMsg.style.display = '';
        return;
    }

    if (viewingStatus === 'ADMIN_REVIEW') {
        const rawReportStatus = (report && (report.status || report.report_status) || '').toString().toUpperCase();
        const isReportPending = rawReportStatus === 'PENDING';

        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        chatBtn.style.display = 'none';
        removeItemBtn.style.display = isReportPending ? 'block' : 'none';
        dismissReportBtn.style.display = isReportPending ? 'block' : 'none';
        alreadyClaimedMsg.style.display = 'none';
        if (adminStatusEl) {
            adminStatusEl.style.display = 'block';
        }
        return;
    }

    // If item is archived, hide claim and report for everyone (except poster delete)
    const rawItemStatus = getRawItemStatus();
    if (rawItemStatus === 'ABANDONED') {
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        removeItemBtn.style.display = 'none';
        dismissReportBtn.style.display = 'none';
        chatBtn.style.display = 'none';
        alreadyClaimedMsg.style.display = 'none';
        return;
    }

    if (isArchived) {
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = viewingStatus === 'USER_POSTED' ? 'block' : 'none';
        chatBtn.style.display = viewingStatus === 'USER_CLAIMED' ? 'block' : 'none';
        removeItemBtn.style.display = 'none';
        dismissReportBtn.style.display = 'none';
        // keep any existing messages visible
        return;
    }

    // If user exceeded attempts, block claiming
    if (userClaimBlocked) {
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = viewingStatus === 'USER_POSTED' ? 'block' : 'none';
        chatBtn.style.display = 'none';
        alreadyClaimedMsg.style.display = 'block';
        return;
    }

    if (viewingStatus === 'USER_POSTED') {
        // User is the poster - show delete button, hide claim and report
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = 'block';
        chatBtn.style.display = 'none';
        removeItemBtn.style.display = 'none';
        dismissReportBtn.style.display = 'none';
        alreadyClaimedMsg.style.display = 'none';
        return;
    }

    if (viewingStatus === 'USER_CLAIMED') {
        // User already claimed - show chat button, hide claim, report, delete
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'block';
        deleteBtn.style.display = 'none';
        chatBtn.style.display = 'block';
        removeItemBtn.style.display = 'none';
        dismissReportBtn.style.display = 'none';
        alreadyClaimedMsg.style.display = 'block';
        return;
    }

    if (viewingStatus === 'ADMIN_REVIEW') {
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        chatBtn.style.display = 'none';
        removeItemBtn.style.display = 'block';
        dismissReportBtn.style.display = 'block';
        alreadyClaimedMsg.style.display = 'none';
        return;
    }

    // Default: user can claim - show claim and report, hide delete and chat
    claimBtn.style.display = 'block';
    reportBtn.style.display = 'block';
    deleteBtn.style.display = 'none';
    chatBtn.style.display = 'none';
    if (claimAttempt > 0) {
        alreadyClaimedMsg.style.display = 'block';
    } else {
        alreadyClaimedMsg.style.display = 'none';
    }
}

function closeRemoveItemModal() {
    document.getElementById('removeItemModal').style.display = 'none';
}

function closeDismissReportModal() {
    document.getElementById('dismissReportModal').style.display = 'none';
}

async function onConfirmRemoveItem() {
    if (!report) {
        alert('No report available to remove.');
        return;
    }
    const result = await adminUtils.acceptReport(report);
    if (result) {
        closeRemoveItemModal();
        report.status = 'ACCEPTED';
        if (item) {
            item.status = 'REMOVED';
        }
        renderItemStatus();
        renderAdminReportStatus();
        updateButtonVisibility();
        showAdminResultModal('Item removed successfully.');
    } else {
        alert(`item remove error`);
    }
}

async function onConfirmDismissReport() {
    if (!report) {
        alert('No report available to dismiss.');
        return;
    }
    const result = await adminUtils.dismissReport(report);
    if (result) {
        closeDismissReportModal();
        report.status = 'DISMISSED';
        renderAdminReportStatus();
        updateButtonVisibility();
        showAdminResultModal('Report dismissed successfully.');
    } else {
        alert(`dismiss report error`);
    }
}

function showAdminResultModal(message) {
    const modal = document.getElementById('adminResultModal');
    const messageEl = document.getElementById('adminResultModalMessage');
    if (!modal || !messageEl) return;
    messageEl.innerText = message;
    modal.style.display = 'flex';
}

function closeAdminResultModal() {
    const modal = document.getElementById('adminResultModal');
    if (!modal) return;
    modal.style.display = 'none';
}

function displayClaimStatistics() {
    const statsContainer = document.getElementById('claimStats');
    const statusCounts = {
        PENDING: 0,
        RESOLVED: 0,
        REJECTED: 0,
        CHATTING: 0,
        OWNER_CONFIRM: 0,
        CANCELED: 0,
        PENDING_RESOLUTION: 0,
        ABANDONED: 0,
    };

    for (let claim of claims) {
        const status = (claim['claim_status'] || claim.claim_status || '').toString().toUpperCase();
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        } else if (status) {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
    }

    const statusMeta = [
        { key: 'PENDING', label: 'Pending', className: 'stat-pending' },
        { key: 'PENDING_RESOLUTION', label: 'Pending Resolution', className: 'stat-pending-resolution' },
        { key: 'CHATTING', label: 'Chatting', className: 'stat-chatting' },
        { key: 'OWNER_CONFIRM', label: 'Owner Confirm', className: 'stat-owner-confirm' },
        { key: 'RESOLVED', label: 'Resolved', className: 'stat-resolved' },
        { key: 'REJECTED', label: 'Rejected', className: 'stat-rejected' },
        { key: 'CANCELED', label: 'Canceled', className: 'stat-canceled' },
        { key: 'ABANDONED', label: 'Abandoned', className: 'stat-abandoned' },
    ];

    let statsHTML = '<div class="stats-row">';
    let hasAny = false;

    for (let meta of statusMeta) {
        const count = statusCounts[meta.key] || 0;
        if (!count) continue;
        hasAny = true;
        statsHTML += `<span class="stat-badge ${meta.className}"><strong>${count}</strong> ${meta.label}</span>`;
    }

    if (!hasAny) {
        statsHTML += '<span class="no-claims-msg">No claims yet</span>';
    }

    statsHTML += '</div>';
    statsContainer.innerHTML = statsHTML;
}

async function abandonItem(e) {
    e.preventDefault();
    let isSuccess = await userUtils.abandonItem(item);
    if (!isSuccess) {
        alert('abandon item error');
    } else {
        if (item) {
            item.status = 'ABANDONED';
        }
        renderItemStatus();
        updateButtonVisibility();
    }
    document.getElementById('deleteModal').style.display = 'none';
}