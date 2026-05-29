import { loadUserData } from "./user_utils.js";

export async function onIndexLoad() {
    let user = await loadUserData();
    if (!user) {
        document.getElementById("btnHome").style.display = "none";
        document.getElementById("btnLogin").style.display = "";
        document.getElementById("btnRegister").style.display = "";
    } else {
        document.getElementById("btnHome").style.display = "";
        document.getElementById("btnLogin").style.display = "none";
        document.getElementById("btnRegister").style.display = "none";
    }
}