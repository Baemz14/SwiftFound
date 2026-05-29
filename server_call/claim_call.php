<?php
include '../include/main_controller.php';
session_start();

$call_state = $_POST['call_state'];
$response = [
    'error_log' => "poop"
];

switch ($call_state) {
    case 'ADD_CLAIM':
        $user_id = $_SESSION['user_id'];
        if (!$user_id) {
            $response['is_added'] = false;
            $response['error_log'] = 'you no login dada';
            break;
        }
        $item_id = $_POST['item_id'];
        $answer_text = $_POST['answer_text'];
        $response['is_added'] = addClaim($user_id, $item_id, $answer_text);
        $response['error_log'] = 'blah blah';
        break;

    case 'UPDATE_STATUS':
        $claim_id = $_POST['claim_id'];
        $status = $_POST['status'];
        if (updateClaimStatus($claim_id, $status)) {
            $response['is_success'] = true;
        } else {
            $response['is_success'] = false;
            $response['error_log'] = "controller error";
        }
        break;

    case 'CONFIRM_OWNER':
        $claim_id = $_POST['claim_id'];
        if (confirmClaimOwner($claim_id)) {
            $response['is_success'] = true;
        } else {
            $response['is_success'] = false;
            $response['error_log'] = "controller error";
        }
        break;

    case 'RESOLVE_CLAIM':
        $claim_id = $_POST['claim_id'];
        if (resolveClaim($claim_id)) {
            $response['is_success'] = true;
        } else {
            $response['is_success'] = false;
            $response['error_log'] = "controller error";
        }
        break;
    
    default:
        $response['error_log'] = "state wong >:(";
        break;
}

header('Content-Type: application/json');
echo json_encode($response);
?>