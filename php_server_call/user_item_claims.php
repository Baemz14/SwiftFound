<?php
include '../include/main_controller.php';

session_start();
$user_id = isset($_SESSION['user_id'])? $_SESSION['user_id']: null;
if (!$user_id) {
    die("you no login dada");
}

$items = getUserItemclaims($user_id);

$response = [
    "items" => $items
];

header('Content-Type: application/json');
echo json_encode($response);
?>