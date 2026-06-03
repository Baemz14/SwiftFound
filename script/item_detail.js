import { callServer } from "/swiftfound/include/call_server.js";
import { CategoryEnumDB, CategoryText, CategoryEnum } from "/swiftfound/enum_constant.js";
import { checkIsLoggedIn } from "/swiftfound/script/user_utils.js";
import * as userUtils from "/swiftfound/script/user_utils.js";

let item = null;
let user = null;
let claims = null;

let isUserPosted = false;
let isUserClaimed = false;
let userClaim = null;
let claimAttempt = 0;
let userClaimBlocked = false; // true when user exceeded allowed attempts
let isArchived = false;

export async function onItemLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    let formData = new FormData();
    formData.append('item_id', urlParams.get('item_id'));
    let data = await callServer('/swiftfound/server_call/item_call.php', formData, "GET_ITEM");
    item = data['item'];
    if (!item) {
        alert(`cant find item`);
        window.location.href = "/swiftfound/browse.php";
    }

    let sessData = await callServer('/swiftfound/server_call/user_call.php', null, "GET_SESSDATA");
    user = sessData['user'];
    if (user) {
        isUserPosted = item['user_id'] === user['user_id'];
    }

    await loadClaims();

    displayClaimStatistics();

    // show overall item status if not PENDING
    try {
        const statusEl = document.getElementById('itemStatus');
        const rawStatus = (item['claim_status'] || item.claim_status || '').toString().toUpperCase();
        // mark as archived for any status other than PENDING
        isArchived = rawStatus && rawStatus !== 'PENDING';
        if (rawStatus && rawStatus !== 'PENDING') {
            // map display text
            let displayText = rawStatus.split('_').map(s => s.charAt(0) + s.slice(1).toLowerCase()).join(' ');
            if (rawStatus === 'OWNER_CONFIRM') displayText = 'Owner Confirmed';
            if (rawStatus === 'REMOVED') displayText = 'Removed';
            if (rawStatus === 'RESOLVED') displayText = 'Resolved';
            if (rawStatus === 'ABANDONED') displayText = 'Abandoned';
            statusEl.innerText = displayText;
            // set class for coloring
            statusEl.className = 'item-status status-' + rawStatus.toLowerCase();
            statusEl.style.display = 'inline-block';
        } else {
            statusEl.style.display = 'none';
        }
    } catch (e) {
        console.warn('itemStatus element not found or error setting status', e);
    }

    document.getElementById('item_image').src = `/swiftfound/img_upload/${item['img_file']}`;
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
    document.getElementById('username').innerText = isUserPosted? "you": item['username'];

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
    document.getElementById('cancelReportBtn').addEventListener('click', closeReportModal);
    document.getElementById('submitReportBtn').addEventListener('click', submitReport);

    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteItem);

    document.getElementById('cancelClaimBtn').addEventListener('click', closeClaimModal);
    document.getElementById('submitClaimBtn').addEventListener('click', claimItem);

    // open chat button listener (if applicable)
    if (user && isUserClaimed) {
        document.getElementById('openChatBtn').addEventListener('click', function() {
            window.location.href = `/swiftfound/chat.php?opening=${userClaim['claim_id']}`;
        });
    }
}

async function loadClaims() {
    claimAttempt = 0;
    isUserClaimed = false;
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
                isUserClaimed = true;
                userClaim = claim;
                console.log(`user already claimed this item`);
                break;
            }
        }
    }

    // update UI messaging about user's claim attempts / active claim
    const alreadyMsgEl = document.getElementById('alreadyClaimedMsg');
    const attemptBadge = document.getElementById('claimAttemptBadge');
    if (isUserClaimed) {
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
    console.log(claimAttempt);
}


function onClaimClick(e) {
    if (isUserPosted) {
        alert(`cannot claim your own stuff >:(`);
        return;
    }
    if (!user) {
        alert(`you no login go login`);
        window.location.href = "/swiftfound/login.php";
        return;
    }
    if (isUserClaimed) {
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
            window.location.href = `/swiftfound/chat.php?opening=${userClaim['claim_id']}`;
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
    const chatBtn = document.getElementById('openChatBtn');
    const alreadyClaimedMsg = document.getElementById('alreadyClaimedMsg');
    
    // If item is archived, hide claim and report for everyone (except poster delete)
    if (isArchived) {
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = isUserPosted ? 'block' : 'none';
        chatBtn.style.display = isUserClaimed ? 'block' : 'none';
        // keep any existing messages visible
        return;
    }

    // If user exceeded attempts, block claiming
    if (userClaimBlocked) {
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = isUserPosted ? 'block' : 'none';
        chatBtn.style.display = 'none';
        alreadyClaimedMsg.style.display = 'block';
        return;
    }

    if (isUserPosted) {
        // User is the poster - show delete button, hide claim and report
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = 'block';
        chatBtn.style.display = 'none';
        alreadyClaimedMsg.style.display = 'none';
        return;
    }

    if (isUserClaimed) {
        // User already claimed - show chat button, hide claim, report, delete
        claimBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        chatBtn.style.display = 'block';
        alreadyClaimedMsg.style.display = 'block';
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

async function deleteItem() {
    // TODO: Implement delete item backend logic
    throw new Error("Delete item not implemented yet");
}

function displayClaimStatistics() {
    const statsContainer = document.getElementById('claimStats');
    
    // Count claims by status
    const pendingCount = claims.filter(c => c['claim_status'] === 'PENDING').length;
    const chattingCount = claims.filter(c => c['claim_status'] === 'CHATTING').length;
    const confirmedCount = claims.filter(c => c['claim_status'] === 'OWNER_CONFIRM').length;
    const totalClaims = pendingCount + chattingCount + confirmedCount;
    
    let statsHTML = '<div class="stats-row">';
    
    if (totalClaims === 0) {
        statsHTML += '<span class="no-claims-msg">No claims yet</span>';
    } else {
        if (pendingCount > 0) statsHTML += `<span class="stat-badge stat-pending"><strong>${pendingCount}</strong> pending claim${pendingCount !== 1 ? 's' : ''}</span>`;
        if (chattingCount > 0) statsHTML += `<span class="stat-badge stat-chatting"><strong>${chattingCount}</strong> chatting</span>`;
        if (confirmedCount > 0) statsHTML += `<span class="stat-badge stat-confirmed"><strong>${confirmedCount}</strong> confirmed</span>`;
    }
    
    statsHTML += '</div>';
    statsContainer.innerHTML = statsHTML;
}