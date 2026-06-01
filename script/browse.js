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
    let isShowResolved = document.getElementById("isShowResolved");
    let searchInput = document.getElementById("searchInput");
    let locationFilter = document.getElementById("locationFilter");

    function applyFilters() {
        let selectedCategory = categoryFilter.value; 
        let showResolved = isShowResolved.checked;
        let searchText = searchInput.value.toLowerCase();
        let locationText = locationFilter.value.toLowerCase();

        let allCards = document.querySelectorAll('.item-card');
        
        allCards.forEach(card => {
            let cardCategory = card.dataset.category;
            let cardStatus = card.dataset.status;
            let cardTitle = card.querySelector('h3').innerText.toLowerCase();
            let cardLocation = card.querySelector('.card-meta span').innerText.toLowerCase();

            let matchesCategory = selectedCategory === "" || cardCategory === selectedCategory;
            let matchesStatus = showResolved || cardStatus !== 'RESOLVED';
            let matchesSearch = searchText === "" || cardTitle.includes(searchText);
            let matchesLocation = locationText === "" || cardLocation.includes(locationText);

            if (matchesCategory && matchesStatus && matchesSearch && matchesLocation) {
                card.style.display = ""; 
            } else {
                card.style.display = "none"; 
            }
        });
    }

    categoryFilter.addEventListener('change', applyFilters);
    isShowResolved.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    locationFilter.addEventListener('input', applyFilters);
    
    // Apply filters initially
    applyFilters();
}

function drawItemCard(item) {
    let listingsWrapper = document.getElementById("listings_wrapper");
    let isUserPosted = false;
    if (user) {
        isUserPosted = item['user_id'] === user['user_id'];
    }
    let newCard = `
        <div id="itemCard_${item.item_id}" class="item-card" data-category="${item['category']}" data-status="${item['status']}">
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