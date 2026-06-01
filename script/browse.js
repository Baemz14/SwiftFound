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

    // --- TRACKING LOGIC ADDED HERE ---
    categoryFilter.addEventListener('change', function() {
        let selectedCategory = this.value; 
        console.log("Dropdown clicked! User wants to see:", selectedCategory);

        let allCards = document.querySelectorAll('.item-card');
        console.log("Found " + allCards.length + " cards on the page.");

        allCards.forEach(card => {
            let cardCategory = card.dataset.category;
            
            if (selectedCategory === "" || cardCategory === selectedCategory) {
                card.style.display = ""; // Show the card
                console.log("Showing card with category:", cardCategory);
            } else {
                card.style.display = "none"; // Hide the card
                console.log("Hiding card with category:", cardCategory);
            }
        });
    });
}

function drawItemCard(item) {
    let listingsWrapper = document.getElementById("listings_wrapper");
    let isUserPosted = false;
    if (user) {
        isUserPosted = item['user_id'] === user['user_id'];
    }
    let newCard = `
        <div id="itemCard_${item.item_id}" class="item-card" data-category="${item['category']}">
            <div class="item-card-img">
                <img src="/swiftfound/img_upload/${item['img_file']}" alt="${item['title']}">
            </div>
            <div class="card-info">
                <div class="category-tag">${CategoryText[CategoryEnum[item['category']]]}</div>
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