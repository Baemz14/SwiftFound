import { callServer } from "/swiftfound/include/call_server.js";
import { CategoryEnumDB, CategoryText, CategoryEnum } from "/swiftfound/enum_constant.js";
import { checkIsLoggedIn } from "/swiftfound/script/user_utils.js";

let itemOn = null;

export async function onBrowseLoad() {
    let listingsWrapper = document.getElementById("listings_wrapper");

    let allItems = (await callServer("/swiftfound/server_call/item_call.php", null, "ALL_ITEMS"))['items'];
    for (let i = 0; i < allItems.length; i++) {
        let newCard = `
            <div id="itemCard_${i}" class="item-card">
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
                        posted by <strong>${allItems[i]['username']}</strong>
                    </div>
                </div>
            </div>
        `;
        listingsWrapper.insertAdjacentHTML('beforeend', newCard);

        let itemCard = document.getElementById("itemCard_"+i);
        itemCard.addEventListener('click', function(){
            claimItem(allItems[i]);
        });
    }

    let categoryFilter = document.getElementById("categoryFilter");
    for (let i = 0; i < CategoryText.length; i++) {
        let newCategory = `
            <option value="${CategoryEnumDB[i]}">${CategoryText[i]}</option>
        `;
        categoryFilter.insertAdjacentHTML('beforeend', newCategory);
    }

    // let answerText = document.getElementById('answerText');
    // let cancelBtn = document.getElementById('cancelBtn');
    // let submitBtn = document.getElementById('submitBtn');
    // cancelBtn.addEventListener('click', function() {
    //     answerText.value = "";
    //     secretDialog.close();
    // });
    // submitBtn.addEventListener('click', async function() {
    //     if(answerText.value === "") {
    //         alert('fill in the answer');
    //         return;
    //     }

    //     let formData = new FormData();
    //     formData.append('item_id', itemOn['item_id']);
    //     formData.append('answer_text', answerText.value);

    //     let data = await callServer('/swiftfound/server_call/claim_call.php', formData, "ADD_CLAIM");
    //     if(data['add_status'] === "success") {
    //         alert('claimed success');
    //     }
    //     else {
    //         alert("ohno somting happen :(");
    //         console.log("add claim error: "+ data['error_log']);
    //     }

    //     answerText.value = "";
    //     secretDialog.close();
    // });
}

async function claimItem(item) {
    if(!item) {
        alert('item dont exist (:O');
        return;
    }
    alert("claiming "+ item['title']);
    return;
    // dont run after code need change

    let is_logged_in = await checkIsLoggedIn();
    if (!is_logged_in) {
        alert("you have to log in to claim. redirecting to login page");
        window.location.href = "/swiftfound/login.php";
        return;
    }

    let secretDialog = document.getElementById("secretDialog").showModal();
    document.getElementById("secretQuestionText").innerHTML = item['secret_question'];

    itemOn = item;
}