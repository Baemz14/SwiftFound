import * as userUtil from "/swiftfound/script/user_utils.js";
import { callServer } from "/swiftfound/include/call_server.js";
import * as chatUtils from "/swiftfound/script/chat_utils.js";
// moved some functions to chat_utils for better organization
let onResolveClaim = chatUtils.onResolveClaim;
let closeResolveClaimModal = chatUtils.closeResolveClaimModal;
let onCancelClaim = chatUtils.onCancelClaim;
let closeCancelClaimModal = chatUtils.closeCancelClaimModal;
let onConfirmOwner = chatUtils.onConfirmOwner;
let closeConfirmOwnerModal = chatUtils.closeConfirmOwnerModal;
let onOpenChat = chatUtils.onOpenChat;
let closeOpenChatModal = chatUtils.closeOpenChatModal;
let onRejectClaim = chatUtils.onRejectClaim;
let closeRejectClaimModal = chatUtils.closeRejectClaimModal;
let getReadReceiptStatus = chatUtils.getReadReceiptStatus;
let formatStatusLabel = chatUtils.formatStatusLabel;
let shouldAllowSend = chatUtils.shouldAllowSend;
let closeStatusDropdown = chatUtils.closeStatusDropdown;
let isDateNewer = chatUtils.isDateNewer;
let dateToNiceString = chatUtils.dateToNiceString;
let getLatestMessagePreview = chatUtils.getLatestMessagePreview;
let getContactUnreadCount = chatUtils.getContactUnreadCount;
let updateContactUnreadBadge = chatUtils.updateContactUnreadBadge;
let getFirstUnreadMessage = chatUtils.getFirstUnreadMessage;
let renderUnreadDivider = chatUtils.renderUnreadDivider;
let readContactChat = chatUtils.readContactChat;
let isChatNewer = chatUtils.isChatNewer;
let hideAllChats = chatUtils.hideAllChats;
let isContactLoaded = chatUtils.isContactLoaded;
let contactIndex = chatUtils.contactIndex;
let updateTopBarUnreadCount = chatUtils.updateTopBarUnreadCount;
import * as chatEvents from "/swiftfound/script/chat_events.js";

let chat = [];
let contact = [];
let user = null;
let activeContact = 0;
let activeTab = 'myClaims'; // default active tab
let activeStatus = 'ALL'; // default active status

const chatKey = [];

export async function chatLoad() {
    chatKey.push(chatUtils.rejectReasonKey, chatUtils.cancelReasonKey, chatUtils.ownerConfirmKey, chatUtils.openChatKey, chatUtils.posterResolveKey, chatUtils.confirmResolutionKey);
    user = await userUtil.loadUserData();
    if (!user) {
        window.location.href = 'login.php';
    }
    chatUtils.setUser(user);
    
    chat = await userUtil.loadNewChat();
    for (const c of chat) {
        processChat(c);
    }
    console.log(chat);
    console.log(contact);

    let contactCont = document.getElementById("contactCont");
    
    // Draw all contacts
    for (const cont of contact) {
        drawNewContact(cont);
        for (const message of cont.chat) {
            drawNewChat(message, cont);
        }
    }
    
    // Set up tab button listeners
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    document.querySelectorAll('.status-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            if (this.classList.contains('dropdown-toggle')) {
                document.getElementById('statusDropdownMenu').classList.toggle('show');
                return;
            }
            switchStatus(this.dataset.status, this);
        });
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            switchStatus(this.dataset.status, document.getElementById('statusDropdownToggle'));
            document.getElementById('statusDropdownMenu').classList.remove('show');
        });
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('#statusDropdown')) {
            document.getElementById('statusDropdownMenu').classList.remove('show');
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    let opening = urlParams.get('opening');
    if (opening) {
        let c = contact.find(c => c.contact_id === opening);
        let tab = c.isClaiming? 'myClaims' : 'claimRequests';
        if (activeTab !== tab) {
            switchTab(tab, false);
        }
        let isArchive = ['RESOLVED', 'REJECTED', 'CANCELED', 'CANCELLED', 'ABANDONED'].includes(c.claimStatus);
        if (isArchive) {
            switchStatus('ARCHIVE_ALL', document.getElementById('statusDropdownToggle'));
        }
        activateChat(opening);
        updateContactsDisplay(false);
    } else if(contact.length > 0) {
        updateContactsDisplay();
    } else {
        switchTab(activeTab);
    }

    document.getElementById('sendBtn').addEventListener('click', onSendMessage);
    document.getElementById('messageTxt').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            onSendMessage(e);
        }
    });

    setInterval(checkNewMessages, 1000);
}

function drawNewContact(contact) {
    let sideContact = document.getElementById(`contact_${contact.contact_id}`);
    if (!sideContact) {
        let contactType = contact.isClaiming ? 'myClaims' : 'claimRequests';
        let contactCont = document.getElementById("contactCont");
        
        let card = `
            <div id="contact_${contact.contact_id}" class="contact-item" data-contact-type="${contactType}" data-chat-status="${contact.claimStatus}" style="justify-content: space-between; width: 100%;">
                <div class="contact-left-group">
                    <div id="avatar" class="avatar">
                        <img id="avatarImg" class="avatar-image" alt="Profile avatar" />
                        <span id="avatarInitial" class="avatar-initial">F</span>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div class="contact-info">
                            <div class="contact-name">
                                <span class="contact-username">${contact.username}</span>
                                <span class="contact-item-title">${contact.item.item_title}</span>
                            </div>
                        </div>
                        <div class="contact-preview-row">
                            <div>
                                <div class="contact-preview" id="preview_${contact.contact_id}">${getLatestMessagePreview(contact)}</div>
                                <span class="contact-status-chip ${getStatusCssClass(contact.claimStatus)}">${formatStatusLabel(contact.claimStatus)}</span>
                            </div>
                            <span class="contact-unread-badge" id="unread_${contact.contact_id}" style="display: ${getContactUnreadCount(contact) > 0 ? '' : 'none'};">${getContactUnreadCount(contact) || ''}</span>
                        </div>
                    </div>
                </div> 
                <div class="contact-item-img-container">
                    <img id="itemImg_${contact.contact_id}" src="${contact.item.item_img ? `img_upload/${contact.item.item_img}` : 'placeholder-item.png'}" class="contact-item-img" alt="Item preview" />
                </div>
            </div>
        `;
        contactCont.insertAdjacentHTML('beforeend', card);
        contactCont.querySelector(`#contact_${contact.contact_id}`).addEventListener('click', function(e) {
            activateChat(contact.contact_id);
        });
    }

    const avatarImg = document.querySelector(`#contact_${contact.contact_id} #avatarImg`);
    const avatarInitial = document.querySelector(`#contact_${contact.contact_id} #avatarInitial`);
    if (avatarImg && avatarInitial) {
        if (contact.avatar_url) {
            avatarImg.src = contact.avatar_url;
            avatarImg.style.display = 'block';
            avatarInitial.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            avatarInitial.style.display = 'block';
            avatarInitial.innerText = contact['username'].charAt(0).toUpperCase();
        }
    }
}

async function checkNewMessages() {
    let newChat = await userUtil.loadNewChat(chat);
    for (const chat of newChat) {
        processChat(chat);
        for (const _cont of contact) {
            if (_cont.contact_id === chat.claim_id) {
                drawNewChat(chat, _cont);
                break;
            }
        }
    }
    chat.push(...newChat);

    const chatMap = new Map(chat.map((data, index) => [data.message_id, index]));
    let updatedChat = await userUtil.loadUpdatedChat(chat);
    if (updatedChat.length > 0) {
        //console.log(updatedChat);
    }
    for (const uc of updatedChat) {
        let i = chatMap.get(uc.message_id);
        if (chat[i]) {
            chat[i] = uc;
            let messageBubble = document.getElementById(`message_${chat[i].message_id}`);
            let chatDate = new Date(chat[i].sent_at);
            const timeString = chatDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            });
            if (messageBubble) {
                const { messageText, messageType } = parseSpecialMessageContent(chat[i].message_content);
                const oldSpecialClasses = Array.from(messageBubble.classList).filter(c => c.startsWith('special-message-'));
                if (oldSpecialClasses.length > 0) {
                    messageBubble.classList.remove(...oldSpecialClasses);
                }
                if (messageType) {
                    messageBubble.classList.add(`special-message-${messageType}`);
                }

                messageBubble.innerHTML = `
                    <div class="message-text">${messageText}</div>
                    <div class="message-meta">
                        <span class="timestamp">${timeString}</span>
                        ${getReadReceiptStatus(chat[i])}
                    </div>
                `;
            }
        }
    }

    let claims = contact.map(c => c.claim);
    let updatedClaims = await userUtil.loadUpdatedClaimStatus(claims);
    for (const claim of updatedClaims) {
        console.log(`claim ${claim.claim_id} has updated status ${claim.claim_status}`);
        updateContactStatus(claim.claim_id, claim.claim_status);
    }
}

function parseSpecialMessageContent(messageContent) {
    let messageText = messageContent;
    let messageType = null;

    for (const key of chatKey) {
        if (messageContent.startsWith(key)) {
            messageText = messageContent.substring(key.length);

            if (key === chatUtils.rejectReasonKey) {
                messageType = 'reject';
            } else if (key === chatUtils.cancelReasonKey) {
                messageType = 'cancel';
            } else if (key === chatUtils.ownerConfirmKey) {
                messageType = 'ownerconfirm';
            } else if (key === chatUtils.openChatKey) {
                messageType = 'openchat';
            } else if (key === chatUtils.posterResolveKey) {
                messageType = 'posterresolve';
            } else if (key === chatUtils.confirmResolutionKey) {
                messageType = 'confirmresolution';
            }
            break;
        }
    }

    return { messageText, messageType };
}

let latestDateDrawn = {};
let firstUnreadChat = {};
function drawNewChat(chat, _contact) {
    if (!(_contact.contact_id in latestDateDrawn)) {
        latestDateDrawn[_contact.contact_id] = new Date("2026-01-01");
    } if (!(_contact.contact_id in firstUnreadChat)) {
        firstUnreadChat[_contact.contact_id] = null;
    }
    let cont = null;
    let isSender = chat.sender_id === user.user_id;
    let contactChat = document.getElementById(`chat_${_contact.contact_id}`);
    if (!contactChat) {
        const isArchived = ['RESOLVED', 'REJECTED', 'CANCELED', 'CANCELLED', 'ABANDONED'].includes(_contact.claimStatus);
        let claimReqBtns = `
            ${isArchived ? '' :
            _contact.claimStatus == 'OWNER_CONFIRM' ? 
                '<button id="resolveBtn" class="btn-primary">confirm resolution</button> <button id="cancelBtn" class="btn-secondary">cancel</button>' : 
                '<button id="ownerBtn" class="btn-primary">confirm owner</button> <button id="rejectBtn" class="btn-danger">reject</button>'}
        `;
        let claimingBtns = `
            ${isArchived ? '' : '<button id="cancelBtn" class="btn-secondary">cancel claim</button>'}
        `;
        let newChat = `
            <div id="chat_${_contact.contact_id}" class="chat-container">
                <div class="chat-header">
                    <div class="chat-header-left">
                        <div id="headerAvatar" class="header-avatar">
                            <img id="headerAvatarImg" class="avatar-image" alt="Profile avatar" />
                            <span id="headerAvatarInitial" class="avatar-initial">F</span>
                        </div>
                        <div class="chat-header-title-group">
                            <div class="chat-header-title-row">
                                <span class="active-user">${_contact.username}</span>
                                <span class="chat-status-chip ${getStatusCssClass(_contact.claimStatus)}">${formatStatusLabel(_contact.claimStatus)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="chat-header-btn-group"></div>
                </div>
                
                <div class="message-area"></div>
            </div>
        `;

        document.getElementById('chatCont').insertAdjacentHTML('beforeend', newChat);
        contactChat = document.getElementById(`chat_${_contact.contact_id}`);
        applyHeaderButtons(_contact, _contact.claimStatus, contactChat);
        contactChat.style.display = "none";

        const avatarImg = document.querySelector(`#chat_${_contact.contact_id} #headerAvatarImg`);
        const avatarInitial = document.querySelector(`#chat_${_contact.contact_id} #headerAvatarInitial`);
        if (avatarImg && avatarInitial) {
            if (_contact.avatar_url) {
                avatarImg.src = _contact.avatar_url;
                avatarImg.style.display = 'block';
                avatarInitial.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarInitial.style.display = 'block';
                avatarInitial.innerText = _contact['username'].charAt(0).toUpperCase();
            }
        }
    }
    let chatDate = new Date(chat.sent_at);
    const timeString = chatDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
    let messageCont = contactChat.querySelector(".message-area");
    
    // Check if message starts with a special key and determine message type
    const { messageText, messageType } = parseSpecialMessageContent(chat.message_content);
    const messageClass = messageType ? `special-message-${messageType}` : '';
    let newMessage = `
        <div id=message_${chat.message_id} class="message ${isSender? "sent": "recieved"} ${messageClass}">
            <div class="message-text">${messageText}</div>
            <div class="message-meta">
                <span class="timestamp">${timeString}</span>
                ${getReadReceiptStatus(chat)}
            </div>
        </div>
    `;
    if (_contact.contact_id !== contact[activeContact]?.contact_id && !firstUnreadChat[_contact.contact_id] && !isSender && chat.is_read == 0) {
        firstUnreadChat[_contact.contact_id] = chat;
        let unreadDivider = messageCont.querySelector(`#unreadDivider_${_contact.contact_id}`);
        if (unreadDivider) {
            unreadDivider.remove();
        }
        let unreadCard = `
            <div id="unreadDivider_${_contact.contact_id}" class="unread-divider">
                <span class="unread-label">New Messages</span>
            </div>
        `;
        newMessage = unreadCard + newMessage;
    }
    let hasUnreadDivider = false;
    if (isDateNewer(chatDate, latestDateDrawn[_contact.contact_id])) {
        latestDateDrawn[_contact.contact_id] = chatDate;
        let dateDivider = `
            <div class="chat-date-divider">
                <span class="chat-date-badge">${dateToNiceString(chatDate)}</span>
            </div>
        `;
        newMessage = dateDivider + newMessage;
    }
    messageCont.insertAdjacentHTML('beforeend', newMessage);

    let unreadDivider = messageCont.querySelector(`#unreadDivider_${_contact.contact_id}`);
    if (unreadDivider) {
        unreadDivider.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    } else {
        messageCont.scrollTop = messageCont.scrollHeight;
    }

    if (contact[activeContact].contact_id === _contact.contact_id) {
        readContactChat(_contact, contact);
    }
    // Update the contact preview with latest message and unread count
    let previewElement = document.getElementById(`preview_${_contact.contact_id}`);
    if (previewElement) {
        previewElement.textContent = getLatestMessagePreview(_contact);
    }
    updateContactUnreadBadge(_contact, contact);
}

function updateChatInputState(contact) {
    const inputArea = document.querySelector('.chat-input-area');
    const notice = document.getElementById('chatDisabledNotice');
    if (!contact) {
        inputArea.style.display = 'none';
        notice.style.display = 'block';
        notice.textContent = 'Select a chat to see messages.';
        return;
    }

    if (contact.claimStatus === 'PENDING') {
        inputArea.style.display = 'none';
        notice.style.display = 'block';
        if (contact.isClaiming) {
            notice.innerHTML = `Chat is not open yet. You can cancel this claim if you no longer want to wait.`;
        } else {
            notice.innerHTML = `Chat is not open yet. Open the chat if you think this might be the owner or reject this claim. <button id="pendingOpenChatBtn" class="btn-primary">Open Chat</button>`;
            notice.querySelector('#pendingOpenChatBtn')?.addEventListener('click', () => onOpenChat(contact));
        }
        return;
    }

    if (shouldAllowSend(contact.claimStatus)) {
        inputArea.style.display = 'flex';
        notice.style.display = 'none';
    } else {
        inputArea.style.display = 'none';
        notice.style.display = 'block';
        notice.textContent = `This chat is archived as ${formatStatusLabel(contact.claimStatus)}. Messages cannot be sent.`;
    }
}

function switchStatus(status, button, forceFirstOpen = true) {
    activeStatus = status;
    document.querySelectorAll('.status-tab').forEach(tab => tab.classList.remove('active'));
    if (button) {
        button.classList.add('active');
    }
    if (!button || button.classList.contains('dropdown-toggle')) {
        document.getElementById('statusDropdownToggle').classList.add('active');
    }
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.status === status);
    });
    updateContactsDisplay(forceFirstOpen);
}

function getStatusCssClass(status) {
    const normalized = {
        'OWNER_CONFIRMED': 'owner_confirm',
        'CANCELLED': 'canceled'
    }[status] || status.toLowerCase();
    return `status-${normalized}`;
}

export function redrawContacts() {
    chatUtils.sortContacts(contact);
    updateContactsDisplay(false);
}

function applyHeaderButtons(contactObj, status, container) {
    const isArchived = ['RESOLVED', 'REJECTED', 'CANCELED', 'CANCELLED', 'ABANDONED'].includes(status);
    const header = container.querySelector('.chat-header');
    let buttonGroup = container.querySelector('.chat-header-btn-group');

    if (isArchived) {
        buttonGroup?.remove();
        return;
    }

    let html = '';
    if (status === 'PENDING') {
        html = contactObj.isClaiming ?
            '<button id="cancelBtn" class="btn-secondary">cancel claim</button>' :
            '<button id="openChatBtn" class="btn-primary">Open Chat</button> <button id="rejectBtn" class="btn-danger">Reject</button>';
    } else if (status === 'OWNER_CONFIRM' || status === 'OWNER_CONFIRMED') {
        if (!contactObj.isClaiming) {
            html = '<button id="resolveBtn" class="btn-primary">Item returned</button>';
        } else {
            html = '<span class="chat-header-note">Claim confirmed. Waiting for the poster to mark the item returned.</span>';
        }
    } else if (status === 'PENDING_RESOLUTION') {
        if (contactObj.isClaiming) {
            html = '<button id="resolveBtn" class="btn-primary">Confirm received</button>';
        } else {
            html = '<span class="chat-header-note">Pending receipt confirmation from the claimer.</span>';
        }
    } else if (contactObj.isClaiming) {
        html = '<button id="cancelBtn" class="btn-secondary">cancel claim</button>';
    } else {
        html = '<button id="ownerBtn" class="btn-primary">confirm owner</button> <button id="rejectBtn" class="btn-danger">reject</button>';
    }

    if (!buttonGroup) {
        buttonGroup = document.createElement('div');
        buttonGroup.className = 'chat-header-btn-group';
        header.appendChild(buttonGroup);
    }
    buttonGroup.innerHTML = html;

    buttonGroup.querySelector('#openChatBtn')?.addEventListener('click', () => onOpenChat(contactObj));
    buttonGroup.querySelector('#resolveBtn')?.addEventListener('click', () => onResolveClaim(contactObj));
    buttonGroup.querySelector('#cancelBtn')?.addEventListener('click', () => onCancelClaim(contactObj));
    buttonGroup.querySelector('#ownerBtn')?.addEventListener('click', () => onConfirmOwner(contactObj));
    buttonGroup.querySelector('#rejectBtn')?.addEventListener('click', () => onRejectClaim(contactObj));
}

export function updateContactStatus(contactId, status) {
    let updatedContact = null;
    contact.forEach(c => {
        if (c.contact_id === contactId) {
            c.claim.claim_status = status;
            c.claimStatus = status;
            updatedContact = c;
        }
    });

    const sideContact = document.getElementById(`contact_${contactId}`);
    if (sideContact) {
        sideContact.dataset.chatStatus = status;
        const statusChip = sideContact.querySelector('.contact-status-chip');
        if (statusChip) {
            statusChip.textContent = formatStatusLabel(status);
            statusChip.className = `contact-status-chip ${getStatusCssClass(status)}`;
        }
    }

    const chatHeaderChip = document.querySelector(`#chat_${contactId} .chat-status-chip`);
    if (chatHeaderChip) {
        chatHeaderChip.textContent = formatStatusLabel(status);
        chatHeaderChip.className = `chat-status-chip ${getStatusCssClass(status)}`;
    }

    const chatContainer = document.getElementById(`chat_${contactId}`);
    if (chatContainer && updatedContact) {
        applyHeaderButtons(updatedContact, status, chatContainer);
    }

    const active = contact[activeContact];
    if (active && active.contact_id === contactId) {
        updateChatInputState(active);
    }

    chatUtils.sortContacts(contact);
}

function processChat(chat) {
    let isSender = user.user_id === chat.sender.user_id;
    let newContact = isSender? chat.reciever: chat.sender;
    newContact.contact_id = chat.claim_id;
    let contactI = -1;
    if (!isContactLoaded(newContact, contact)) {
        newContact.isClaiming = chat.claimer_id === user.user_id;
        newContact.item = chat.item;
        newContact.chat = [chat];
        newContact.claimStatus = chat.claim_status;
        newContact.claim = {
            claim_id: chat.claim_id,
            claim_status: chat.claim_status,
            claimer_id: chat.claimer_id,
            poster_id: chat.claimer_id === chat.sender.user_id? chat.reciever.user_id : chat.sender.user_id,
        }
        contact.push(newContact);
        chatUtils.setContactList(contact);
        contactI = contact.length - 1;
        drawNewContact(newContact);
    } else {
        contactI = contactIndex(newContact, contact);
        contact[contactI].chat.push(chat);
    }
}

function activateChat(contactId) {
    // Find the contact and switch to the correct tab
    for (const cont of contact) {
        if (cont.contact_id === contactId) {
            //console.log(`auto switching to tab for contact ${contactId}`);
            let tabName = cont.isClaiming ? 'myClaims' : 'claimRequests';
            if (activeTab !== tabName) {
                //console.log(`auto switching to tab ${tabName} for contact ${contactId}`);
                switchTab(tabName);
            }
            break;
        }
    }
    
    let sideContact = document.getElementById(`contact_${contactId}`);
    let chatCont = document.getElementById(`chat_${contactId}`);
    if (!sideContact || !chatCont) {
        console.log('some error');
        return;
    }
    sideContact.classList.add('active');
    sideContact.scrollIntoView({
        behavior: 'auto', // Use 'smooth' if you want a clean sliding animation
        block: 'nearest'  // Aligns the bubble cleanly within the view boundaries
    });
    chatCont.style.display = "";
    //throw new Error(sideContact.classList);
    //console.log(sideContact.classList);

    let i = 0;
    for (const cont of contact) {
        if (cont.contact_id === contactId) {
            const url = new URL(window.location);
            url.searchParams.set('opening', cont.contact_id);
            window.history.pushState({}, '', url);
            //throw new Error(`activating chat for contact ${cont.contact_id}`);
            activeContact = i;
            continue;
        }
        let sc = document.getElementById(`contact_${cont.contact_id}`);
        let cc = document.getElementById(`chat_${cont.contact_id}`);
        if (sc && cc) {
            sc.classList.remove('active');
            cc.style.display = "none";
        }
        i++;
    }

    const messageCont = chatCont.querySelector('.message-area');
    let unreadDivider = renderUnreadDivider(contactId, contact);

    if (unreadDivider) {
        unreadDivider.scrollIntoView({
            behavior: 'auto',
            block: 'nearest'
        });
    } else {
        messageCont.scrollTop = messageCont.scrollHeight;
    }

    readContactChat(contact[activeContact], contact);
    updateChatInputState(contact[activeContact]);
}

function switchTab(tabName, forceFirstOpen = true) {
    activeTab = tabName;
    
    // Update tab button styles
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update contacts display
    updateContactsDisplay(forceFirstOpen);
}

export function updateContactsDisplay(forceOpenFirst = true) {
    let firstVisibleContactId = null;

    document.querySelectorAll('.contact-item').forEach(item => {
        const contactType = item.dataset.contactType;
        const status = item.dataset.chatStatus;
        const isTypeMatch = contactType === activeTab;
        const isArchived = ['RESOLVED', 'REJECTED', 'CANCELED', 'CANCELLED', 'ABANDONED'].includes(status);
        let isStatusMatch = status === activeStatus;
        if (isArchived) {
            isStatusMatch = isStatusMatch || activeStatus === 'ARCHIVE_ALL' || activeStatus === 'ALL' ;
        } else {
           isStatusMatch = isStatusMatch || activeStatus === 'ALL' ;
        }
        const shouldShow = isTypeMatch && isStatusMatch;
        item.style.display = shouldShow ? '' : 'none';

        if (!firstVisibleContactId && shouldShow) {
            firstVisibleContactId = item.id.replace('contact_', '');
        }
    });

    if (firstVisibleContactId && forceOpenFirst) {
        //console.log(`activating chat for contact ${firstVisibleContactId} because it's the first visible contact`);
        activateChat(firstVisibleContactId);
    } else if (forceOpenFirst) {
        hideAllChats();
    }
}

async function onSendMessage(e) {
    let text = document.getElementById('messageTxt').value;
    if (text.length <= 0) {
        return;
    }
    let reciever = contact[activeContact];
    if (await userUtil.sendMessage(user.user_id, reciever.user_id, text, reciever.contact_id)) {
        document.getElementById('messageTxt').value = "";
        checkNewMessages(chat);
    } else {
        throw new Error("server send message error");
    }
}