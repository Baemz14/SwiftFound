import { callServer } from "../include/call_server.js";
import * as chatUtils from "./chat_utils.js";

export async function checkIsLoggedIn() {
    //let data = await callServer('server_call/user_call.php', null, "GET_SESSDATA");
    //return data['is_logged_in'];
    
    // changed new code
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
    let claimerId = claim.claimer.user_id;
    let posterId = claim.poster.user_id;
    let posterQuestion = claim.item.secret_question;
    let claimerAnswer = claim.answer_text;

    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    formData.append('status', "CHATTING");
    let data = await callServer('server_call/claim_call.php', formData, "UPDATE_STATUS");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
        return false;
    }

    if (!sendMessage(posterId, claimerId, posterQuestion, claim.claim_id)) {
        return false;
    } if (!sendMessage(claimerId, posterId, claimerAnswer, claim.claim_id)) {
        return false;
    }

    console.log("Chat opened successfully");
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

export async function confirmOwner(claim) {
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
    return true;
}

export async function resolveClaim(claim) {
    let formData = new FormData();
    formData.append('claim_id', claim.claim_id);
    let data = await callServer('server_call/claim_call.php', formData, "RESOLVE_CLAIM");
    if (!data['is_success']) {
        console.log(`server error: ${data['error_log']}`);
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
    return true;
}