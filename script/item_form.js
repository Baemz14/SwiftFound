import { checkIsLoggedIn } from "/swiftfound/script/user_utils.js";
import { CategoryText, CategoryEnumDB } from "/swiftfound/enum_constant.js";
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
    let categoryInt = parseInt(document.getElementById("category").value, 10);
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
    formData.append("title", itemTitle);
    formData.append("category", CategoryEnumDB[categoryInt]);
    formData.append("desc", desc);
    formData.append("location", location);
    formData.append("img", imgPointer);
    formData.append("secret_question", secretQuestion);

    let data = await callServer("/swiftfound/server_call/item_call.php", formData, "UPLOAD");
    if (data['upload_status'] === "success") {
        alert("item uploaded :D");
        window.location.href = "/swiftfound/home.php";
    }
}