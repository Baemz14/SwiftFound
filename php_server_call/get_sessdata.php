<?php
session_start();

$response = [
    'is_logged_in' => isset($_SESSION['user_id']),
    'user_id' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null
];

header('Content-Type: application/json');
echo json_encode($response);
?>