<?php
include '../include/main_controller.php';

$items = getItems();
$response = [
    "items" => $items
];

header('Content-Type: application/json');
echo json_encode($response);
?>