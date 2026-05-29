<?php
include '../include/main_controller.php';
session_start();

$call_state = $_POST['call_state'];
$response = [
    'error_log' => "poop"
];

switch ($call_state) {
    case 'ADD_CHAT':
        $user_id = $_SESSION['user_id'];
        $sender_id = $_POST['sender_id'];
        $reciever_id = $_POST['reciever_id'];
        $claim_id = $_POST['claim_id'];
        $text = $_POST['text'];
        if (!$user_id) {
            $response['is_success'] = false;
            $response['error_log'] = 'you no login dada';
            break;
        } if (!$sender_id || !$reciever_id || !$claim_id || !$text) {
            $response['is_success'] = false;
            $response['error_log'] = 'param not enough';
            break;
        } if ($user_id !== $sender_id && $user_id !== $reciever_id) {
            $response['is_success'] = false;
            $response['error_log'] = 'sender/reciever id not equal logged in id';
            break;
        } if (!addChat($sender_id, $reciever_id, $text, $claim_id)) {
            $response['is_success'] = false;
            $response['error_log'] = 'controller error';
            break;
        }
        $response['is_success'] = true;
        break;

    case "SET_CHATS_READ":
        if (isset($_POST['chat_ids'])) {
            $chat_ids = json_decode($_POST['chat_ids'], true);
            if (count($chat_ids) <= 0) {
                $response['is_success'] = false;
                $response['error_log'] = "chat ids passed length is 0";
                break;
            } if (setChatsRead($chat_ids)) {
                $response['is_success'] = true;
                $response['error_log'] = "non ting";
            } else {
                $response['is_success'] = false;
                $response['error_log'] = "controller error";
            }
            break;
        }
        $response['is_success'] = false;
        $response['error_log'] = "chat ids is not passed";
        break;
    
    default:
        $response['error_log'] = "state wong >:(";
        break;
}

header('Content-Type: application/json');
echo json_encode($response);
?>