import * as userUtil from "/swiftfound/script/user_utils.js";
import { callServer } from "/swiftfound/include/call_server.js";
import * as chatUtils from "/swiftfound/script/chat_utils.js";

export function onResolveClaimConfirm(_contact) {
    // Fill in your confirmation logic here
    console.log("Resolved claim for contact:", _contact);
    chatUtils.closeResolveClaimModal();
}

export function onCancelClaimConfirm(_contact) {
    // Fill in your confirmation logic here
    if (userUtil.cancelClaim(_contact.claim)) {
        console.log("Claim cancelled for contact:", _contact);
    } else {
        console.error("Failed to cancel claim for contact:", _contact);
    }
    chatUtils.closeCancelClaimModal();
}

export function onConfirmOwnerConfirm(_contact) {
    // Fill in your confirmation logic here
    if (userUtil.confirmOwner(_contact.claim)) {
        console.log("Owner confirmed for contact:", _contact);
    } else {
        console.error("Failed to confirm owner for contact:", _contact);
    }
    chatUtils.closeConfirmOwnerModal();
}

export function onRejectClaimConfirm(_contact) {
    // Fill in your confirmation logic here
    if (userUtil.rejectClaim(_contact.claim)) {
        console.log("Claim rejected for contact:", _contact);
    } else {
        console.error("Failed to reject claim for contact:", _contact);
    }
    chatUtils.closeRejectClaimModal();
}