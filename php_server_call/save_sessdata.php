<?php
session_start();

$user_id = $_POST['user_id'];
$_SESSION['user_id'] = $user_id;

$response = [
    'status' => 'success'
];

header('Content-Type: application/json');
echo json_encode($response);
?>