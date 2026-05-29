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
    for (let i = 0; i < allItems.length; i++) {
        let isUserPosted = false;
        if (user) {
            isUserPosted = allItems[i]['user_id'] === user['user_id'];
        }
        
        let newCard = `
            <div id="itemCard_${i}" class="item-card" data-category="${allItems[i]['category']}">
                <div class="item-card-img">
                    <img src="/swiftfound/img_upload/${allItems[i]['img_file']}" alt="${allItems[i]['title']}">
                </div>
                <div class="card-info">
                    <div class="category-tag">${CategoryText[CategoryEnum[allItems[i]['category']]]}</div>
                    <h3>${allItems[i]['title']}</h3>
                    <div class="card-meta">
                        <span> loc: ${allItems[i]['location']}</span>
                    </div>
                    <div class="posted-by">
                        posted by <strong>${isUserPosted? "you": allItems[i]['username']}</strong>
                    </div>
                </div>
            </div>
        `;
        listingsWrapper.insertAdjacentHTML('beforeend', newCard);

        let itemCard = document.getElementById("itemCard_"+i);
        itemCard.addEventListener('click', function(){
            window.location.href = `item_detail.php?item_id=${allItems[i]['item_id']}`;
        });
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