<?php
// TODO: dah ada controller utk handle smue ni, so kalu db tuka tinggal tukar controller je
session_start();
include '../db_stuff/db_conn.php';
header('Content-Type: application/json');

// Ensure the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$response = ['status' => 'success', 'items' => []];

// Query: Get all items posted by this specific user
$stmt = $conn->prepare("
    SELECT *
    FROM item 
    WHERE user_id = ? 
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $response['items'][] = $row;
}

echo json_encode($response);
$stmt->close();
?>