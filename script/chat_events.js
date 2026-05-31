import * as userUtil from "/swiftfound/script/user_utils.js";
import { callServer } from "/swiftfound/include/call_server.js";
import * as chatUtils from "/swiftfound/script/chat_utils.js";
import { redrawContacts, updateContactStatus } from "/swiftfound/script/chat.js";

export async function onResolveClaimConfirm(_contact) {
    // Fill in your confirmation logic here
    console.log("Resolved claim for contact:", _contact);
    chatUtils.closeResolveClaimModal();
    updateContactStatus(_contact.contact_id, "RESOLVED");
}

export async function onCancelClaimConfirm(_contact) {
    let reason = document.getElementById("cancelReasonInput").value;
    if (!reason || reason.trim() === "") {
        reason = "No reason provided";
    }
    let isSuccess = await userUtil.cancelClaim(_contact.claim, reason);
    if (isSuccess) {
        console.log("Claim cancelled for contact:", _contact);
    } else {
        console.error("Failed to cancel claim for contact:", _contact);
    }
    chatUtils.closeCancelClaimModal();
    updateContactStatus(_contact.contact_id, "CANCELLED");
}

export async function onConfirmOwnerConfirm(_contact) {
    // Fill in your confirmation logic here
    let isSuccess = await userUtil.confirmOwner(_contact.claim);
    if (isSuccess) {
        console.log("Owner confirmed for contact:", _contact);
    } else {
        console.error("Failed to confirm owner for contact:", _contact);
    }
    chatUtils.closeConfirmOwnerModal();
    updateContactStatus(_contact.contact_id, "OWNER_CONFIRMED");
}

export async function onRejectClaimConfirm(_contact) {
    // Fill in your confirmation logic here
    let reason = document.getElementById("rejectReasonInput").value;
    let isSuccess = await userUtil.rejectClaim(_contact.claim, reason);
    if (isSuccess) {
        console.log("Claim rejected for contact:", _contact);
    } else {
        console.error("Failed to reject claim for contact:", _contact);
    }
    chatUtils.closeRejectClaimModal();
    updateContactStatus(_contact.contact_id, "REJECTED");
}