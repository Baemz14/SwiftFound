import { checkIsLoggedIn } from "/swiftfound/script/user_utils.js";
import { CategoryText } from "/swiftfound/enum_constant.js";
import { callServer } from "/swiftfound/include/call_server.js";

export async function itemFormLoad() {
    let isLoggedIn = await checkIsLoggedIn();
    if (!isLoggedIn) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.php';
    }

    let itemForm = document.getElementById("itemForm");
    itemForm.addEventListener("submit", onItemSubmit);

    //fill category
    let categorySelect = document.getElementById("category");
    for (let i = 0; i < CategoryText.length; i++) {
        categorySelect.innerHTML += "<option value=\"" + i + "\">" + CategoryText[i] + "</option>";
    }
}

async function onItemSubmit(event) {
    event.preventDefault();

    let itemTitle = document.getElementById("title").value;
    let categoryInt = document.getElementById("category").value;
    let desc = document.getElementById("description").value;
    let location = document.getElementById("location").value;
    let imgFile = document.getElementById("img");
    let secretQuestion = document.getElementById("secret_question").value;

    if(
        itemTitle === "" ||
        categoryInt < 0 || categoryInt >= CategoryText.length ||
        location === "" ||
        imgFile.files.length <= 0 || 
        secretQuestion === ""
    ) {
        alert("fill all form plis >:|");
        return;
    }

    let imgPointer = imgFile.files[0];

    let formData = new FormData();
    formData.append("item_img", imgPointer);
    formData.append("item_title", itemTitle);

    let data = await callServer("/swiftfound/php_server_call/upload_item.php", formData);
    if (data['upload_status'] === "success") {
        console.log("saved successfully as: " + data['saved_as']);
    }
}