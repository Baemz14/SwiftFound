import * as userUtil from "/swiftfound/script/user_utils.js";
import { callServer } from "/swiftfound/include/call_server.js";

let chat = [];
let contact = [];
let user = null;
let activeContact = 0;

export async function chatLoad() {
    user = await userUtil.loadUserData();
    if (!user) {
        window.location.href = 'login.php';
    }
    
    chat = await userUtil.loadNewChat();
    for (const c of chat) {
        processChat(c);
    }
    console.log(chat);
    console.log(contact);

    let contactCont = document.getElementById("contactCont");
    for (const cont of contact) {
        let card = `
            <div id="contact_${cont.contact_id}" class="contact-item" style="justify-content: space-between; width: 100%;">
                <div class="contact-left-group">
                    <div id="avatar" class="avatar">
                        <img id="avatarImg" class="avatar-image" alt="Profile avatar" />
                        <span id="avatarInitial" class="avatar-initial">F</span>
                    </div>
                    <div style="flex: 1;">
                        <div class="contact-info">
                            <div class="contact-name">
                                <span class="contact-username">${cont.username}</span>
                                <span class="contact-item-title">${cont.item.item_title}</span>
                            </div>
                        </div>
                        <div class="contact-preview">claiming ${cont.isClaiming? `${cont.username}'s`: "your"} item</div>
                    </div>
                </div> 
                <div class="contact-item-img-container">
                    <img id="itemImg_${cont.contact_id}" src="${cont.item.item_img ? `img_upload/${cont.item.item_img}` : 'placeholder-item.png'}" class="contact-item-img" alt="Item preview" />
                </div>
            </div>
        `;
        contactCont.insertAdjacentHTML('beforeend', card);
        contactCont.querySelector(`#contact_${cont.contact_id}`).addEventListener('click', function(e) {
            activateChat(cont.contact_id);
        });

        const avatarImg = document.querySelector(`#contact_${cont.contact_id} #avatarImg`);
        const avatarInitial = document.querySelector(`#contact_${cont.contact_id} #avatarInitial`);
        if (avatarImg && avatarInitial) {
            if (cont.avatar_url) {
                avatarImg.src = cont.avatar_url;
                avatarImg.style.display = 'block';
                avatarInitial.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarInitial.style.display = 'block';
                avatarInitial.innerText = cont['username'].charAt(0).toUpperCase();
            }
        }

        for (const message of cont.chat) {
            drawNewChat(message, cont);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    let opening = urlParams.get('opening');
    if (opening) {
        activateChat(opening);
    } else if(contact.length > 0) {
        activateChat(contact[0].contact_id);
    } else {
        // do someting
    }

    document.getElementById('sendBtn').addEventListener('click', onSendMessage);
    document.getElementById('messageTxt').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            onSendMessage(e);
        }
    });

    setInterval(checkNewMessages, 1000);

    // 1. Define the tripwire rules
    const rules = {
        root: document.querySelector('.message-area'), // Watch inside the chat box
        threshold: 0.5 // Trigger when half of the message bubble is visible
    };
    // 2. Define the action to take when the tripwire is crossed
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 'isIntersecting' is a boolean: true = walked into view, false = scrolled out
            if (entry.isIntersecting) {
                console.log("This message is now being read by the user!");
                
                let messageDiv = entry.target;
                // Run your database fetch update code here...
                
                // Crucial: Stop watching this message since it's already read
                observer.unobserve(messageDiv);
            }
        });
    }, rules);
    // 3. Tell the observer which specific items to track
    const unreadBubbles = document.querySelectorAll('.message.received:not(.read)');
    unreadBubbles.forEach(bubble => observer.observe(bubble));
}

async function checkNewMessages() {
    let newChat = await userUtil.loadNewChat(chat);
    for (const chat of newChat) {
        //console.log(chat);
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
        console.log(updatedChat);
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
                messageBubble.innerHTML = `
                    <div class="message-text">${chat[i].message_content}</div>
                    <div class="message-meta">
                        <span class="timestamp">${timeString}</span>
                        ${getReadReceiptStatus(chat[i])}
                    </div>
                `;
            }
        }
    }
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
        let newChat = `
            <div id="chat_${_contact.contact_id}" class="chat-container">
                <div class="chat-header">
                    <div id="headerAvatar" class="header-avatar">
                        <img id="headerAvatarImg" class="avatar-image" alt="Profile avatar" />
                        <span id="headerAvatarInitial" class="avatar-initial">F</span>
                    </div>
                    <div class="active-user">${_contact.username}</div>
                </div>
                
                <div class="message-area"></div>
            </div>
        `;
        document.getElementById('chatCont').insertAdjacentHTML('beforeend', newChat);
        contactChat = document.getElementById(`chat_${_contact.contact_id}`);
        contactChat.style.display = "none";
    }
    let chatDate = new Date(chat.sent_at);
    const timeString = chatDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
    let messageCont = contactChat.querySelector(".message-area");
    let newMessage = `
        <div id=message_${chat.message_id} class="message ${isSender? "sent": "recieved"}">
            <div class="message-text">${chat.message_content}</div>
            <div class="message-meta">
                <span class="timestamp">${timeString}</span>
                ${getReadReceiptStatus(chat)}
            </div>
        </div>
    `;
    if (!firstUnreadChat[_contact.contact_id] && !isSender && chat.is_read == 0) {//make an unread bubble
        firstUnreadChat[_contact.contact_id] = chat;
        let unreadDivider = messageCont.querySelector("#unreadDivider");
        if (unreadDivider) {
            unreadDivider.remove();
        }
        let unreadCard = `
            <div id="unreadDivider" class="unread-divider">
                <span class="unread-label">New Messages</span>
            </div>
        `;
        newMessage = unreadCard + newMessage;
    }
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
    messageCont.scrollTop = messageCont.scrollHeight;

    if (contact[activeContact].contact_id === _contact.contact_id) {
        readContactChat(_contact);
    }
}

function getReadReceiptStatus(chat) {
    // If it's a double checkmark, can also wrap it in a class for blue coloring later
    if (chat.is_read == 1) {
        return '<span class="tick read-blue">✓✓</span>';
    }
    return '<span class="tick">✓</span>';
}

function isDateNewer(date, toCompare) {
    const d1 = new Date(date).setHours(0, 0, 0, 0);
    const d2 = new Date(toCompare).setHours(0, 0, 0, 0);
    return d1 > d2;
}

function dateToNiceString(date) {
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

function processChat(chat) {
    let isSender = user.user_id === chat.sender.user_id;
    let newContact = isSender? chat.reciever: chat.sender;
    newContact.contact_id = chat.claim_id;
    let contactI = -1;
    if (!isContactLoaded(newContact)) {
        newContact.isClaiming = chat.claimer_id === user.user_id;
        newContact.item = chat.item;
        contact.push(newContact);
        contactI = contact.length-1;
        contact[contactI].chat = [];
    } else {
        contactI = contactIndex(newContact);
    }
    contact[contactI].chat.push(chat);
}

function activateChat(contactId) {
    let sideContact = document.getElementById(`contact_${contactId}`);
    let chatCont = document.getElementById(`chat_${contactId}`);
    if (!sideContact || !chatCont) {
        console.log('some error');
        return;
    }
    sideContact.classList.add('active');
    chatCont.style.display = "";

    let i = 0;
    for (const cont of contact) {
        if (cont.contact_id === contactId) {
            const url = new URL(window.location);
            url.searchParams.set('opening', cont.contact_id);
            window.history.pushState({}, '', url);
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

    let messageCont = chatCont.querySelector(".message-area");
    let unreadDivider = messageCont.querySelector("#unreadDivider");
    let isThereUnread = false;
    for (const c of contact[activeContact].chat) {
        if (c.sender_id === user.user_id || c.is_read == 1) {
            continue;
        }
        let lastUnreadChat = firstUnreadChat[contactId];
        if (lastUnreadChat) {
            if (lastUnreadChat === c) {
                continue;
            } if (unreadDivider) {
                unreadDivider.remove();
            }
            let unreadCard = `
                <div id="unreadDivider" class="unread-divider">
                    <span class="unread-label">New Messages</span>
                </div>
            `;
            document.getElementById(`message_${c.message_id}`).insertAdjacentHTML('beforebegin', unreadCard);
            unreadDivider = messageCont.querySelector("#unreadDivider");
            firstUnreadChat[contactId] = c;
            isThereUnread = true;
            break;
        }
    } if(!isThereUnread) {
        if(unreadDivider) {
            unreadDivider.remove();
        }
    }
    if (unreadDivider) {
        unreadDivider.scrollIntoView({
            behavior: 'auto', // Use 'smooth' if you want a clean sliding animation
            block: 'nearest'  // Aligns the bubble cleanly within the view boundaries
        });
    } else {
        messageCont.scrollTop = messageCont.scrollHeight;
    }
    readContactChat(contact[activeContact]);
}

function isChatNewer(chat, isNewer) {
    return isNewer.sent_at > chat.sent_at;
}

function readContactChat(contact) {
    let contactChat = [];
    for (const c of contact.chat) {
        if (c.sender_id === contact.user_id) {
            contactChat.push(c);
        }
    }
    userUtil.setChatsRead(contactChat);
}

function isContactLoaded(newContact) {
    for (const cont of contact) {
        if (cont.contact_id === newContact.contact_id) {
            return true;
        }
    } return false;
}

function contactIndex(newContact) {
    for (let i = 0; i < contact.length; i++) {
        if (contact[i].contact_id === newContact.contact_id) {
            return i;
        }
    } return -1;
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