import { callServer } from "/swiftfound/include/call_server.js";
import { CategoryEnumDB, CategoryText, CategoryEnum } from "/swiftfound/enum_constant.js";
import { checkIsLoggedIn } from "/swiftfound/script/user_utils.js";

let itemOn = null;
let user = null;

export async function onBrowseLoad() {
    let sessData = await callServer('/swiftfound/server_call/user_call.php', null, "GET_SESSDATA");
    user = sessData['user'];

  if (user) {
        let navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.innerHTML = `
                <a href="home.php" class="btn-reg">My Dashboard</a>
            `;
        }
    }

    let listingsWrapper = document.getElementById("listings_wrapper");

    let allItems = (await callServer("/swiftfound/server_call/item_call.php", null, "ALL_ITEMS"))['items'];
    console.log("Loaded items:", allItems);
    for (let i = 0; i < allItems.length; i++) {
        drawItemCard(allItems[i]);
    }

    let categoryFilter = document.getElementById("categoryFilter");
    for (let i = 0; i < CategoryText.length; i++) {
        let newCategory = `
            <option value="${CategoryEnumDB[i]}">${CategoryText[i]}</option>
        `;
        categoryFilter.insertAdjacentHTML('beforeend', newCategory);
    }

    let showResolvedCheckbox = document.getElementById('showResolved');
    let showAbandonedCheckbox = document.getElementById('showAbandoned');
    let showOwnerConfirmCheckbox = document.getElementById('showOwnerConfirm');

    function filterItems() {
        let selectedCategory = categoryFilter.value;
        let showResolved = showResolvedCheckbox?.checked;
        let showAbandoned = showAbandonedCheckbox?.checked;
        let showOwnerConfirm = showOwnerConfirmCheckbox?.checked;

        let allCards = document.querySelectorAll('.item-card');
        allCards.forEach(card => {
            let cardCategory = card.dataset.category;
            let cardStatus = card.dataset.status || 'PENDING';
            let categoryMatches = selectedCategory === "" || cardCategory === selectedCategory;
            let statusMatches = true;

            if (cardStatus === "PENDING") {
                statusMatches = true;
            } else if (cardStatus === "RESOLVED") {
                statusMatches = showResolved;
            } else if (cardStatus === "ABANDONED") {
                statusMatches = showAbandoned;
            } else if (cardStatus === "OWNER_CONFIRM") {
                statusMatches = showOwnerConfirm;
            }

            card.style.display = categoryMatches && statusMatches ? "" : "none";
        });
    }

    categoryFilter.addEventListener('change', filterItems);
    [showResolvedCheckbox, showAbandonedCheckbox, showOwnerConfirmCheckbox].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', filterItems);
        }
    });
}


function drawItemCard(item) {
    let listingsWrapper = document.getElementById("listings_wrapper");
    let isUserPosted = false;
    if (user) {
        isUserPosted = item['user_id'] === user['user_id'];
    }

    let status = item['status'] || 'PENDING';
    let statusLabel = '';
    if (status !== 'PENDING') {
        let statusClass = status.toLowerCase().replace(/_/g, '-');
        let statusText = status.replace(/_/g, ' ');
        statusLabel = `<div class="status-pill ${statusClass}">${statusText}</div>`;
    }

    let newCard = `
        <div id="itemCard_${item.item_id}" class="item-card" data-category="${item['category']}" data-status="${status}">
            <div class="item-card-img">
                <img src="/swiftfound/img_upload/${item['img_file']}" alt="${item['title']}">
            </div>
            <div class="card-info">
                <div class="card-header">
                    <div class="category-tag">${CategoryText[CategoryEnum[item['category']]]}</div>
                    ${statusLabel}
                </div>
                <h3>${item['title']}</h3>
                <div class="card-meta">
                    <span> loc: ${item['location']}</span>
                </div>
                <div class="posted-by">
                    posted by <strong>${isUserPosted? "you": item['username']}</strong>
                </div>
                <div class="posted-at">
                    ${new Date(item.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    `;
    listingsWrapper.insertAdjacentHTML('beforeend', newCard);
    let itemCard = document.getElementById("itemCard_"+item.item_id);
    itemCard.addEventListener('click', function(){
        window.location.href = `item_detail.php?item_id=${item.item_id}`;
    });
}