import * as userUtil from "/swiftfound/script/user_utils.js";
import { callServer } from "/swiftfound/include/call_server.js";
import * as chatEvents from "/swiftfound/script/chat_events.js";

export const rejectReasonKey = `/r`;
export const cancelReasonKey = `/c`;
export const ownerConfirmKey = `/o`;

let user = null;
export function setUser(u) {
    user = u;
}

let contactList = [];
export function setContactList(cl) {
    contactList = cl;
}

export function onResolveClaim(_contact) {
    const modal = document.getElementById('resolveClaimModal');
    const confirmBtn = document.getElementById('resolveClaimBtn');
    const cancelBtn = document.getElementById('cancelResolveBtn');
    
    modal.classList.add('show');
    
    confirmBtn.onclick = () => chatEvents.onResolveClaimConfirm(_contact);
    cancelBtn.onclick = () => closeResolveClaimModal();
}

export function closeResolveClaimModal() {
    const modal = document.getElementById('resolveClaimModal');
    modal.classList.remove('show');
}

export function onCancelClaim(_contact) {
    const modal = document.getElementById('cancelClaimModal');
    const confirmBtn = document.getElementById('cancelClaimBtn');
    const cancelBtn = document.getElementById('cancelCancelBtn');
    
    modal.classList.add('show');
    
    document.getElementById('cancelReasonInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            chatEvents.onCancelClaimConfirm(_contact)
        }
    });
    confirmBtn.onclick = () => chatEvents.onCancelClaimConfirm(_contact);
    cancelBtn.onclick = () => closeCancelClaimModal();
}

export function closeCancelClaimModal() {
    const modal = document.getElementById('cancelClaimModal');
    modal.classList.remove('show');
}

export function onConfirmOwner(_contact) {
    const modal = document.getElementById('confirmOwnerModal');
    const confirmBtn = document.getElementById('confirmOwnerBtn');
    const cancelBtn = document.getElementById('cancelOwnerBtn');
    
    modal.classList.add('show');
    
    confirmBtn.onclick = () => chatEvents.onConfirmOwnerConfirm(_contact);
    cancelBtn.onclick = () => closeConfirmOwnerModal();

    const rejectingClaimersList = document.getElementById('rejectingClaimersList');
    rejectingClaimersList.innerHTML = '';
    const rejectingClaimers = contactList.filter(c => !c.isClaiming && c.contact_id !== _contact.contact_id && c.item.item_id === _contact.item.item_id);
    if (rejectingClaimers.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No other claimers';
        rejectingClaimersList.appendChild(listItem);
    }
    rejectingClaimers.forEach(claimer => {
        const listItem = document.createElement('li');
        listItem.textContent = claimer.username;
        rejectingClaimersList.appendChild(listItem);
    });
}

export function closeConfirmOwnerModal() {
    const modal = document.getElementById('confirmOwnerModal');
    modal.classList.remove('show');
}

export function onOpenChat(_contact) {
    const modal = document.getElementById('openChatModal');
    const confirmBtn = document.getElementById('openChatConfirmBtn');
    const cancelBtn = document.getElementById('openChatCancelBtn');

    modal.classList.add('show');
    confirmBtn.onclick = () => chatEvents.onOpenChatConfirm(_contact);
    cancelBtn.onclick = () => closeOpenChatModal();
}

export function closeOpenChatModal() {
    const modal = document.getElementById('openChatModal');
    modal.classList.remove('show');
}

export function onRejectClaim(_contact) {
    const modal = document.getElementById('rejectClaimModal');
    const confirmBtn = document.getElementById('rejectClaimBtn');
    const cancelBtn = document.getElementById('cancelRejectBtn');
    
    modal.classList.add('show');
    
    document.getElementById('rejectReasonInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            chatEvents.onRejectClaimConfirm(_contact)
        }
    });
    confirmBtn.onclick = () => chatEvents.onRejectClaimConfirm(_contact);
    cancelBtn.onclick = () => closeRejectClaimModal();
}

export function closeRejectClaimModal() {
    const modal = document.getElementById('rejectClaimModal');
    modal.classList.remove('show');
}

export function getReadReceiptStatus(chat) {
    // If it's a double checkmark, can also wrap it in a class for blue coloring later
    if (chat.is_read == 1) {
        return '<span class="tick read-blue">✓✓</span>';
    }
    return '<span class="tick">✓</span>';
}

export function formatStatusLabel(status) {
    switch (status) {
        case 'CHATTING':
            return 'Chatting';
        case 'OWNER_CONFIRM':
        case 'OWNER_CONFIRMED':
            return 'Owner Confirm';
        case 'RESOLVED':
            return 'Resolved';
        case 'REJECTED':
            return 'Rejected';
        case 'CANCELED':
        case 'CANCELLED':
            return 'Canceled';
        case 'PENDING':
            return 'Pending';
        default:
            return status || 'Unknown';
    }
}

export function shouldAllowSend(status) {
    return status === 'CHATTING' || status === 'OWNER_CONFIRM' || status === 'OWNER_CONFIRMED';
}

export function closeStatusDropdown() {
    document.getElementById('statusDropdownMenu').classList.remove('show');
}

export function isDateNewer(date, toCompare) {
    const d1 = new Date(date).setHours(0, 0, 0, 0);
    const d2 = new Date(toCompare).setHours(0, 0, 0, 0);
    return d1 > d2;
}

export function dateToNiceString(date) {
    // 1. Create a "Today" reference and flatten its time to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 2. Flatten the input date's time to midnight as well
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // 3. Calculate the absolute difference in time (in milliseconds)
    const differenceInTime = today.getTime() - targetDate.getTime();
    
    // 4. Convert milliseconds to full calendar days (1 day = 24h * 60m * 60s * 1000ms)
    const differenceInDays = Math.round(differenceInTime / (1000 * 60 * 60 * 24));
    
    // 5. Check if it falls within our 3-day window
    if (differenceInDays === 0) {
        return "Today";
    } else if (differenceInDays === 1) {
        return "Yesterday";
    } else if (differenceInDays > 1 && differenceInDays <= 3) {
        // Returns "Monday", "Tuesday", etc.
        return targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        // 6. Older than 3 days: Format as d/m/yyyy (No leading zeroes)
        const day = targetDate.getDate();
        const month = targetDate.getMonth() + 1; // getMonth() is 0-indexed
        const year = targetDate.getFullYear();
        
        return `${day}/${month}/${year}`;
    }
}

export function getLatestMessagePreview(contact) {
    if (!contact.chat || contact.chat.length === 0) {
        return "No messages yet";
    }
    
    let latestMsg = contact.chat[contact.chat.length - 1];
    let senderName = latestMsg.sender_id === user.user_id ? "You" : contact.username;
    let preview = `${senderName}: ${latestMsg.message_content}`;
    
    // Truncate if too long
    if (preview.length > 50) {
        preview = preview.substring(0, 47) + "...";
    }
    
    return preview;
}

export function getContactUnreadCount(contact) {
    if (!contact.chat || contact.chat.length === 0) {
        return 0;
    }
    return contact.chat.reduce((count, msg) => {
        if (msg.sender_id !== user.user_id && msg.is_read == 0) {
            return count + 1;
        }
        return count;
    }, 0);
}

export function updateTopBarUnreadCount(contact) {
    const claimBadge = document.getElementById('unread_claim');
    const requestBadge = document.getElementById('unread_request');
    const claimCount = contact.filter(c => c.isClaiming).reduce((sum, c) => sum + getContactUnreadCount(c), 0);
    const requestCount = contact.filter(c => !c.isClaiming).reduce((sum, c) => sum + getContactUnreadCount(c), 0);
    if (claimCount > 0) {
        claimBadge.textContent = claimCount;
        claimBadge.style.display = '';
    } else {
        claimBadge.style.display = 'none';
    }
    if (requestCount > 0) {
        requestBadge.textContent = requestCount;
        requestBadge.style.display = '';
    } else {
        requestBadge.style.display = 'none';
    }
}

export function updateContactUnreadBadge(contact, contactList) {
    let badge = document.getElementById(`unread_${contact.contact_id}`);
    if (!badge) return;

    const count = getContactUnreadCount(contact);
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = '';
    } else {
        badge.style.display = 'none';
    }
    updateTopBarUnreadCount(contactList);
    sortContacts(contactList);
}

function getStatusPriority(status) {
    const normalized = (status === 'CANCELLED') ? 'CANCELED' : status;
    const priorityMap = {
        'OWNER_CONFIRM': 0,
        'OWNER_CONFIRMED': 0,
        'CHATTING': 1,
        'PENDING': 2,
        'RESOLVED': 3,
        'REJECTED': 4,
        'CANCELED': 5
    };
    return priorityMap[normalized] !== undefined ? priorityMap[normalized] : 5;
}

export function sortContacts(contactList) {
    const contactContainer = document.getElementById('contactCont');
    if (!contactContainer) return;

    const contacts = Array.from(contactContainer.children).map(el => ({
        element: el,
        contact_id: el.id.replace('contact_', '')
    }));

    contacts.sort((a, b) => {
        const contactA = contactList.find(c => c.contact_id == a.contact_id);
        const contactB = contactList.find(c => c.contact_id == b.contact_id);
        
        if (!contactA || !contactB) return 0;

        const unreadA = getContactUnreadCount(contactA);
        const unreadB = getContactUnreadCount(contactB);

        // Sort by unread count first (descending - highest first)
        if (unreadA !== unreadB) {
            return unreadB - unreadA;
        }

        // Then by status priority
        const priorityA = getStatusPriority(contactA.claimStatus);
        const priorityB = getStatusPriority(contactB.claimStatus);
        
        return priorityA - priorityB;
    });

    // Re-append in sorted order
    contacts.forEach(item => {
        contactContainer.appendChild(item.element);
    });
}

export function getFirstUnreadMessage(contact) {
    if (!contact || !Array.isArray(contact.chat)) {
        return null;
    }
    return contact.chat.find(msg => msg.sender_id !== user.user_id && msg.is_read == 0) || null;
}

export function renderUnreadDivider(contactId, contactList) {
    const chatCont = document.getElementById(`chat_${contactId}`);
    if (!chatCont) {
        return null;
    }
    const messageCont = chatCont.querySelector('.message-area');
    if (!messageCont) {
        return null;
    }

    const existingDivider = messageCont.querySelector(`#unreadDivider_${contactId}`);
    const contactObj = contactList.find(c => c.contact_id === contactId);
    const firstUnreadMessage = getFirstUnreadMessage(contactObj);

    if (!firstUnreadMessage) {
        if (existingDivider) {
            existingDivider.remove();
        }
        return;
    }

    const firstUnreadMessageElement = document.getElementById(`message_${firstUnreadMessage.message_id}`);
    if (existingDivider && firstUnreadMessageElement && existingDivider.nextElementSibling === firstUnreadMessageElement) {
        return existingDivider;
    }

    if (existingDivider) {
        existingDivider.remove();
    }

    const unreadCard = `
        <div id="unreadDivider_${contactId}" class="unread-divider">
            <span class="unread-label">New Messages</span>
        </div>
    `;

    if (firstUnreadMessageElement && messageCont.contains(firstUnreadMessageElement)) {
        firstUnreadMessageElement.insertAdjacentHTML('beforebegin', unreadCard);
    } else {
        messageCont.insertAdjacentHTML('beforeend', unreadCard);
    }

    return messageCont.querySelector(`#unreadDivider_${contactId}`);
}

export function readContactChat(contact, contactList) {
    let contactChat = [];
    for (const c of contact.chat) {
        if (c.sender_id === contact.user_id && c.is_read == 0) {
            contactChat.push(c);
            c.is_read = 1;
            const messageBubble = document.getElementById(`message_${c.message_id}`);
            if (messageBubble) {
                const timestampEl = messageBubble.querySelector('.timestamp');
                const timestampText = timestampEl ? timestampEl.textContent : '';
                const metaEl = messageBubble.querySelector('.message-meta');
                if (metaEl) {
                    metaEl.innerHTML = `
                        <span class="timestamp">${timestampText}</span>
                        ${getReadReceiptStatus(c)}
                    `;
                }
                messageBubble.classList.add('read');
            }
        }
    }
    updateContactUnreadBadge(contact, contactList);
    if (contactChat.length > 0) {
        userUtil.setChatsRead(contactChat).catch(console.error);
    }
}

export function isChatNewer(chat, isNewer) {
    return isNewer.sent_at > chat.sent_at;
}

export function hideAllChats() {
    document.querySelectorAll('.chat-container').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });
    const inputArea = document.querySelector('.chat-input-area');
    const notice = document.getElementById('chatDisabledNotice');
    if (inputArea) inputArea.style.display = 'none';
    if (notice) {
        notice.style.display = 'block';
        notice.textContent = 'No chat matches the selected filter.';
    }
}

export function isContactLoaded(newContact, contactList) {
    for (const cont of contactList) {
        if (cont.contact_id === newContact.contact_id) {
            return true;
        }
    } return false;
}

export function contactIndex(newContact, contactList) {
    for (let i = 0; i < contactList.length; i++) {
        if (contactList[i].contact_id === newContact.contact_id) {
            return i;
        }
    } return -1;
}