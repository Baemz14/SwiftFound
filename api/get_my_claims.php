<?php
// TODO: dah ada controller utk handle smue ni, so kalu db tuka tinggal tukar controller je
session_start();
include '../db_stuff/db_conn.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$response = ['status' => 'success', 'claims' => []];

// Join the claim and item tables to get both the status and the item details
$stmt = $conn->prepare("
    SELECT *
    FROM claim c
    JOIN item i ON c.item_id = i.item_id
    WHERE c.user_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $response['claims'][] = $row;
}

echo json_encode($response);
$stmt->close();
?>