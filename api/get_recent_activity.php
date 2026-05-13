<?php
session_start();
include '../db_stuff/db_conn.php';
header('Content-Type: application/json');

// Ensure the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$response = ['status' => 'success', 'recent_items' => []];

// Query: Get the 5 most recent items posted by this user
// Notice we are selecting img_file here so the frontend can display it
$stmt = $conn->prepare("
    SELECT title, category, found_or_lost, created_at, img_file 
    FROM item 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 5
");

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $response['recent_items'][] = $row;
}

echo json_encode($response);
$stmt->close();
?>