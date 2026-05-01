<?php
include '../include/main_controller.php';

$item_id = $_POST['item_id'];

$item = getItem($item_id);
$response = [
    "item" => $item
];

header('Content-Type: application/json');
echo json_encode($response);
?>