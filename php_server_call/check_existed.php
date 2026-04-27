<?php
include '../include/main_controller.php';

$username = $_POST['uname'];

$is_user_exist = userExists($username);
$response = [
    'is_user_exist' => $is_user_exist ? 'yes' : 'no'
];

header('Content-Type: application/json');
echo json_encode($response);
?>