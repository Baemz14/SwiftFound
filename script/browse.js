import { callServer } from "/swiftfound/include/call_server.js";

export async function onBrowseLoad() {
    let listingsWrapper = document.getElementById("listings_wrapper");

    let allItems = (await callServer("/swiftfound/php_server_call/all_items.php"))['items'];
    console.log(allItems)
    for (let i = 0; i < allItems.length; i++) {
        listingsWrapper.innerHTML += `
            <div class="item-card">
                <img src="/swiftfound/img_upload/`+ allItems[i]['img_file'] +`" alt="some Image">
                <h3>`+ allItems[i]['title'] +`</h3>
                <div>`+ allItems[i]['category'] +`</div>
                <div>`+ allItems[i]['description'] +`</div>
                <div>`+ allItems[i]['location'] +`</div>
            </div>
        `;
    }
}