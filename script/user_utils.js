import { callServer } from "../include/call_server.js";
import * as chatUtils from "./chat_utils.js";

export async function checkIsLoggedIn() {
    let user = await loadUserData();
    if(!user) {
        return false;
    }
    return true;
}

export async function loadUserData() {
    let data = await callServer('server_call/user_call.php', null, "GET_USER");
    if (!data.user_id) {
        return null;
    }

    return {
        "user_id": data.user_id,
        "username": data.username,
        "reputation": data.reputation,
        "avatar_url": data.avatar_url || null
    };
}

export async function saveLogin(user_id) {
    let formData = new FormData();
    formData.append('user_id', user_id);
    let data = await callServer('server_call/user_call.php', formData, "LOGIN");
    if (data['status'] === 'success') {
        console.log("Login data saved");
    } else {
        alert("Failed to save login data");
    }
}

export async function claimItem(item_id, poster_id, claimer_id, question, answer) {
    let formData = new FormData();
    formData.append('item_id', item_id);
    formData.append('answer_text', answer);
    let data = await callServer('/swiftfound/server_call/claim_call.php', formData, "ADD_CLAIM");
    if (!data['is_added']) {
        console.log(`something went wong: ${data['error_log']}`);
        return false;
    }
    let isSent = await sendMessage(poster_id, claimer_id, question, data.claim.claim_id);
    if (!isSent) {
        console.log("Failed to send question message");
        return false;
    }
    isSent = await sendMessage(claimer_id, poster_id, answer, data.claim.claim_id);
    if (!isSent) {
        console.log("Failed to send answer message");
        return false;
    }
    return true;
}

export async function loadNewItem(loadedItem=null) {
    let data = await callServer("server_call/user_call.php", null, "USER_ITEMS");
    if (data['items'].length <= 0) {
        return [];
    } if (!loadedItem) {
        return data['items'];
    } if (data['items'].length >= loadedItem.length) {
        data['items'].splice(0, loadedItem.length);
    }
    return data['items'];
}

export async function loadNewClaim(loadedClaim=null) {
    let data = await callServer("server_call/user_call.php", null, "USER_CLAIMS");
    if (data['claims'].length <= 0) {
        return [];
    } if (!loadedClaim) {
        return data['claims'];
    } if (data['claims'].length >= loadedClaim.length) {
        data['claims'].splice(0, loadedClaim.length);
    }
    return data['claims'];
}

export async function loadNewClaimReq(loadedClaimReq=null) {
    let data = await callServer("server_call/user_call.php", null, "USER_CLAIM_REQ");
    if (data['claim_req'].length <= 0) {
        return [];
    } if (!loadedClaimReq) {
        return data['claim_req'];
    } if (data['claim_req'].length >= loadedClaimReq.length) {
        data['claim_req'].splice(0, loadedClaimReq.length);
    }
    return data['claim_req']; 
}

export async function loadNewChat(loadedChat=null) {
    let data = await callServer("server_call/user_call.php", null, "USER_CHAT");
    if (data['chats'].length <= 0) {
        return [];
    } if (!loadedChat) {
        return data['chats'];
    } if (data['chats'].length >= loadedChat.length) {
        // console.log(loadedChat);
        // console.log(data['chats']);
        data['chats'].splice(0, loadedChat.length);
        // console.log(data['chats']);
    }
    return data['chats']; 
}

export async function getUnreadMessageCount(loadedChat=null) {
    let user = await loadUserData();
    if (!user) {
        return 0;
    }
    let chats = loadedChat;
    if (!chats) {
        chats = await loadNewChat();
    }
    return countUnreadMessages(chats, user.user_id);
}

export function countUnreadMessages(chats, user_id) {
    if (!Array.isArray(chats)) {
        return 0;
    }
    return chats.reduce((count, msg) => {
        if (msg.sender_id !== user_id && msg.is_read == 0) {
            return count + 1;
        }
        return count;
    }, 0);
}

export async function openChat(claim) {
    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    formData.append('status', "CHATTING");
    let data = await callServer('server_call/claim_call.php', formData, "UPDATE_STATUS");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    let isSent = await sendMessage(claim.poster_id, claim.claimer_id, `${chatUtils.openChatKey}The chat for this claim has been opened. You can disscuss more about ownership verification!`, claim.claim_id);
    if (!isSent) {
        console.log("Failed to send open chat message");
        return false;
    }
    return true;
}

export async function sendMessage(
    sender_id, reciever_id,
    text, claim_id
) {
    let formData = new FormData();
    formData.append('sender_id', sender_id);
    formData.append('reciever_id', reciever_id);
    formData.append('text', text);
    formData.append('claim_id', claim_id);
    let data = await callServer('server_call/chat_call.php', formData, "ADD_CHAT");
    if (!data['is_success']) {
        throw new Error(`server send message error: ${data['error_log']}`);
        return false;
    }
    return true;
}

export async function setChatsRead(chats) {
    let chatIds = [];
    for (const c of chats) {
        chatIds.push(c.message_id);
    }
    if (chatIds.length <= 0) {
        return false;
    }
    let formData = new FormData();
    formData.append('chat_ids', JSON.stringify(chatIds));
    let data = await callServer('server_call/chat_call.php', formData, "SET_CHATS_READ");
    if (!data['is_success']) {
        throw new Error(`server, set chats read error: ${data['error_log']}`);
        return false;
    }
    return true;
}

export async function loadUpdatedChat(loadedChat) {
    let data = await callServer("server_call/user_call.php", null, "USER_CHAT");
    if (data['chats'].length <= 0) {
        return [];
    }
    const newChatMap = new Map(data['chats'].map(data => [data.message_id, data]));   
    let updatedChats = [];
    for (const c of loadedChat) {
        let newC = newChatMap.get(c.message_id);
        if (c.message_content == "hellolo") {
            console.log(c);
            console.log(newC);
        }
        if (!newC) {
            continue;
        } if (newC.is_read != c.is_read) {
            updatedChats.push(newC);
        }
    }
    return updatedChats;
}

export async function loadUpdatedClaimStatus(loadedClaim) {
    let data = await callServer("server_call/user_call.php", null, "USER_CLAIM_REQ");
    let data2 = await callServer("server_call/user_call.php", null, "USER_CLAIMS");
    let allClaims = data['claim_req'].concat(data2['claims']);
    if (allClaims.length <= 0) {
        return [];
    }
    const newClaimReqMap = new Map(allClaims.map(data => [data.claim_id, data]));   
    let updatedClaim = [];
    for (const c of loadedClaim) {
        let newC = newClaimReqMap.get(c.claim_id);
        if (newC && newC.claim_status !== c.claim_status) {
            updatedClaim.push(newC);
        }
    }
    return updatedClaim;
}

export async function confirmOwner(contact) {
    let claim = contact.claim;
    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    let data = await callServer('server_call/claim_call.php', formData, "CONFIRM_OWNER");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    let isSent = await sendMessage(claim.poster_id, claim.claimer_id, `${chatUtils.ownerConfirmKey}The poster has confirmed you are the owner. You can start discussing exchange details!`, claim.claim_id);
    if (!isSent) {
        console.log("Failed to send owner confirmation message");
        return false;
    }
    formData.append('item_id', contact.item.item_id);
    formData.append('new_status', "OWNER_CONFIRM");
    data = await callServer('server_call/item_call.php', formData, "UPDATE_STATUS");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    return true;
}

export async function rejectClaim(claim, reason) {
    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    formData.append('status', "REJECTED");
    let data = await callServer('server_call/claim_call.php', formData, "UPDATE_STATUS");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    let isSent = await sendMessage(claim.poster_id, claim.claimer_id, `${chatUtils.rejectReasonKey}This claim has been rejected. Reason from poster: ${reason}`, claim.claim_id);
    if (!isSent) {
        console.log("Failed to send rejection message");
        return false;
    }
    let isUpdated = await updateReputation(claim.claimer_id, -3);
    if (!isUpdated) {
        console.log("Failed to update claimer reputation");
        return false;
    }
    return true;
}

export async function posterResolveClaim(claim) {
    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    let data = await callServer('server_call/claim_call.php', formData, "POSTER_RESOLVE");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    let message = `${chatUtils.posterResolveKey}The poster has marked this claim as resolved. Please confirm the resolution or raise a dispute if there are any issues.`;
    let isSent = await sendMessage(claim.poster_id, claim.claimer_id, message, claim.claim_id);
    if (!isSent) {
        console.log("Failed to send poster resolution message");
        return false;
    }
    return true;
}

export async function confirmResolution(claim) {
    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    let data = await callServer('server_call/claim_call.php', formData, "CONFIRM_RESOLUTION");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    let message = `${chatUtils.confirmResolutionKey}This claim has been resolved. Thats great! If you have any feedback about the process, please let us know!`;
    let isSent = await sendMessage(claim.claimer_id, claim.poster_id, message, claim.claim_id);
    if (!isSent) {
        console.log("Failed to send poster resolution message");
        return false;
    }
    let isUpdated = await updateReputation(claim.poster_id, 10);
    if (!isUpdated) {
        console.log("Failed to update poster reputation");
        return false;
    }
    isUpdated = await updateReputation(claim.claimer_id, 5);
    if (!isUpdated) {
        console.log("Failed to update claimer reputation");
        return false;
    }
    return true;
}

export async function cancelClaim(claim, reason) {
    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    formData.append('status', "CANCELED");
    let data = await callServer('server_call/claim_call.php', formData, "UPDATE_STATUS");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    let isSent = await sendMessage(claim.claimer_id, claim.poster_id, `${chatUtils.cancelReasonKey}This claim has been canceled. Reason from claimer: ${reason}`, claim.claim_id);
    if (!isSent) {
        console.log("Failed to send cancellation message");
        return false;
    }
    let isUpdated = await updateReputation(claim.claimer_id, -1);
    if (!isUpdated) {
        console.log("Failed to update claimer reputation");
        return false;
    }
    return true;
}

export async function itemClaims(item_id) {
    let formData = new FormData();
    formData.append('item_id', item_id);
    let data = await callServer('server_call/item_call.php', formData, "ITEM_CLAIMS");
    if (!data['claims']) {
        console.log(`server error: ${data['error_log']}`);
        return [];
    }
    return data['claims'];
}

export async function updateReputation(user_id, change) {
    let formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('change', change);
    let data = await callServer('server_call/user_call.php', formData, "UPDATE_REPUTATION");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }
    return true;
}

export async function abandonItem(item_id, poster_id, claim_id = null) {
    // Set item status to ABANDONED
    let formData = new FormData();
    formData.append('item_id', item_id);
    formData.append('new_status', 'ABANDONED');
    let data = await callServer('server_call/item_call.php', formData, 'UPDATE_STATUS');
    if (!data['is_success']) {
        console.log(`Failed to set item ABANDONED: ${data['error_log']}`);
        return false;
    }

    // Deduct -7 reputation from the poster
    let isUpdated = await updateReputation(poster_id, -7);
    if (!isUpdated) {
        console.log('Failed to update poster reputation for abandon');
        return false;
    }

    return true;
}

export function getReputationLabel(reputation) {
    if (Number.isNaN(reputation)) {
        return { label: 'NOVICE', className: 'rep-novice' };
    }
    if (reputation < 0)   return { label: 'CAUTIOUS', className: 'rep-cautios' };
    if (reputation <= 19)  return { label: 'NOVICE',   className: 'rep-novice' };
    if (reputation <= 49)  return { label: 'HELPFUL',  className: 'rep-helpful' };
    if (reputation <= 99)  return { label: 'TRUSTED',  className: 'rep-trusted' };
    return                        { label: 'GUARDIAN', className: 'rep-guardian' };
}

export async function reportItem(item, reason, details) {
    let formData = new FormData();
    formData.append('reported_item_id', item.item_id);
    formData.append('reported_user_id', item.user_id);
    formData.append('reason', reason);
    formData.append('details', details);
    let data = await callServer('server_call/item_call.php', formData, 'REPORT_ITEM');
    if (!data['is_success']) {
        console.log(`Failed to report item: ${data['error_log']}`);
        return false;
    }
    return true;
}
