<?php
include '../include/main_controller.php';
session_start();

$user_data = isset($_SESSION['user_id']) ? getUser($_SESSION['user_id']) : null;

$response = [
    'user_id' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null,
    'username' => $user_data ? $user_data['username'] : null,
    'reputation' => $user_data ? $user_data['reputation'] : null
];

header('Content-Type: application/json');
echo json_encode($response);
?>