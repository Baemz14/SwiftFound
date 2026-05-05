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
            $response['error_log'] = 'you no login dada';
            break;
        }
        $item_id = $_POST['item_id'];
        $answer_text = $_POST['answer_text'];
        $response['add_status'] = addClaim($user_id, $item_id, $answer_text)? "success": "failed";
        $response['error_log'] = 'blah blah';
        break;
    
    default:
        $response['error_log'] = "state wong >:(";
        break;
}

header('Content-Type: application/json');
echo json_encode($response);
?>