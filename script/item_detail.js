import { callServer } from "/swiftfound/include/call_server.js";
import { CategoryEnumDB, CategoryText, CategoryEnum } from "/swiftfound/enum_constant.js";
import { checkIsLoggedIn } from "/swiftfound/script/user_utils.js";

let item = null;
let user = null;
let isUserPosted = false;
let isUserClaimed = false;

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

    let claimData = await callServer('/swiftfound/server_call/user_call.php', null, "USER_CLAIMS");
    for (const claim of claimData['claims']) {
        if (item['item_id'] === claim['item_id']) {
            isUserClaimed = true;
            break;
        }
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
    document.getElementById('rep').innerText = item['reputation'];

    document.getElementById('claimBtn').addEventListener('click', onClaimClick);
    document.getElementById('reportBtn').addEventListener('click', function(e) {
        if (!user) {
            alert("You must be logged in to report an item");
            return;
        }
        document.getElementById('reportModal').style.display = 'flex';
    });
    document.getElementById('cancelReportBtn').addEventListener('click', closeReportModal);
    document.getElementById('submitReportBtn').addEventListener('click', submitReport);

    document.getElementById('cancelClaimBtn').addEventListener('click', closeClaimModal);
    document.getElementById('submitClaimBtn').addEventListener('click', claimItem);
}

function onClaimClick(e) {
    if (isUserPosted) {
        // TODO: alert only for dev, later want to add nicer way to alert user
        alert(`cannot claim your own stuff >:(`);
        return;
    } if (!user) {
        alert(`you no login go login`);
        window.location.href = "/swiftfound/login.php";
        return;
    } if (isUserClaimed) {
        alert(`already claimed this item`);
        return;
    }
    document.getElementById('claimModal').style.display = 'flex';
}

async function claimItem(e) {
    e.preventDefault();
    let answer = document.getElementById('answer').value;
    if (answer === "") {
        alert(`plis give your answer`);
        return;
    }
    let formData = new FormData();
    formData.append('item_id', item['item_id']);
    formData.append('answer_text', answer);
    let data = await callServer('/swiftfound/server_call/claim_call.php', formData, "ADD_CLAIM");
    if (data['is_added']) {
        closeClaimModal();
        document.getElementById('successModal').style.display = "";
        document.getElementById('btnOk').addEventListener('click', function() {document.getElementById('successModal').style.display = "none";});
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

async function submitReport() {
    const reason = document.getElementById('reportReason').value;
    const details = document.getElementById('reportDetails').value;

    if (!reason) {
        alert('Please select a reason for reporting');
        return;
    }

    let formData = new FormData();
    formData.append('item_id', item['item_id']);
    formData.append('reason', reason);
    formData.append('details', details);

    let response = await callServer('/swiftfound/server_call/item_call.php', formData, "REPORT_ITEM");
    
    if (response['success']) {
        alert('Thank you for your report. Our team will review it shortly.');
        closeReportModal();
    } else {
        alert('Error submitting report: ' + (response['message'] || 'Unknown error'));
    }
}