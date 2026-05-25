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
                    <div>
                        <div class="contact-info">
                            <div class="contact-name">${cont.username}</div>
                        </div>
                        <div class="contact-preview">claiming ${cont.isClaiming? `${cont.username}'s`: "your"} item: ${cont.item.item_title}</div>
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

        let contactChat = document.getElementById(`chat_${cont.contact_id}`);
        if (!contactChat) {
            let newChat = `
                <div id="chat_${cont.contact_id}" class="chat-container">
                    <div class="chat-header">
                        <div id="headerAvatar" class="header-avatar">
                            <img id="headerAvatarImg" class="avatar-image" alt="Profile avatar" />
                            <span id="headerAvatarInitial" class="avatar-initial">F</span>
                        </div>
                        <div class="active-user">${cont.username}</div>
                    </div>
                    
                    <div class="message-area"></div>
                </div>
            `;
            document.getElementById('chatCont').insertAdjacentHTML('beforeend', newChat);
            contactChat = document.getElementById(`chat_${cont.contact_id}`);
            contactChat.style.display = "none";
        }
        let messageCont = contactChat.querySelector(".message-area");
        for (const message of cont.chat) {
            let isSender = message.sender.user_id === user.user_id;
            let newMessage = `
                <div class="message ${isSender? "sent": "recieved"}">
                    ${message.message_content}
                    <span class="timestamp">10:14 AM</span>
                </div>
            `;
            messageCont.insertAdjacentHTML('beforeend', newMessage);
        }
    }

    activateChat(contact[0].contact_id);

    document.getElementById('sendBtn').addEventListener('click', onSendMessage);
    document.getElementById('messageTxt').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            onSendMessage(e);
        }
    });

    setInterval(checkNewMessages, 1000);
}

async function checkNewMessages() {
    let newChat = await userUtil.loadNewChat(chat);
    for (const chat of newChat) {
        processChat(chat);
        drawNewChat(chat);
    }
    chat.push(...newChat);
}

function drawNewChat(chat) {
    let cont = null;
    let isSender = false;
    for (const _cont of contact) {
        if (_cont.user_id === chat.sender.user_id) {
            cont = _cont;
            isSender = false;
            break;
        } else if (_cont.user_id === chat.reciever.user_id) {
            cont = _cont;
            isSender = true;
            break;
        }
    }
    if (!cont) {
        throw new Error('cant find contact');
        return;
    }
    let contactChat = document.getElementById(`chat_${cont.contact_id}`);
    let messageCont = contactChat.querySelector(".message-area");
    let newMessage = `
        <div class="message ${isSender? "sent": "recieved"}">
            ${chat.message_content}
            <span class="timestamp">10:14 AM</span>
        </div>
    `;
    messageCont.insertAdjacentHTML('beforeend', newMessage);
    messageCont.scrollTop = messageCont.scrollHeight;
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
    // TODO: make it so it scrolls to last read
    let messageCont = chatCont.querySelector(".message-area");
    messageCont.scrollTop = messageCont.scrollHeight;
    let i = 0;
    for (const cont of contact) {
        if (cont.contact_id === contactId) {
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