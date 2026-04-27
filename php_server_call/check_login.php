<?php
include '../include/main_controller.php';

$username = $_POST['uname'];
$password = $_POST['pass'];

$is_valid_user = findUser($username, $password);
$response = [
    'status' => $is_valid_user ? 'success' : 'failed',
    'user_id' => $is_valid_user ? getUserId($username) : null
];

header('Content-Type: application/json');
echo json_encode($response);
?>