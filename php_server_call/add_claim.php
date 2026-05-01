<?php
include '../include/main_controller.php';
session_start();

$user_id = $_SESSION['user_id'];
if (!$user_id) {
    die('you no login dada');
}
$item_id = $_POST['item_id'];
$answer_text = $_POST['answer_text'];

$response = [
    'add_status' => addClaim($user_id, $item_id, $answer_text)? "success": "failed",
    'error_log' => 'blah blah'
];

header('Content-Type: application/json');
echo json_encode($response);
?>