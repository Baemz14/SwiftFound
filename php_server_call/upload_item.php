<?php
include '../include/main_controller.php';

session_start();
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
if(!$user_id) {
    die("not logged in");
}

$upload_destination = "../img_upload/";
$basename = $_FILES['img']['name'];
$filename = time() . "_" . $basename;

$tmp_loc = $_FILES['img']['tmp_name'];
$is_upload_success = move_uploaded_file($tmp_loc, $upload_destination . $filename);

$title = $_POST['title'];
$category = $_POST['category'];
$desc = $_POST['desc'];
$location = $_POST['location'];
$secret_question = $_POST['secret_question'];

$tz = new DateTimeZone('Asia/Kuala_Lumpur');
$date = new DateTime('now', $tz);
$created_at = $date->format('Y-m-d H:i:s');

$is_add_item_success = addItem(
    $user_id,
    $title,
    $category,
    $desc,
    $location,
    $filename,
    $secret_question,
    $created_at,
    "FOUND"
);

$response = [
    "upload_status" => $is_upload_success? "success": "failed",
    "saved_as" => $is_upload_success? $filename : null
];

header('Content-Type: application/json');
echo json_encode($response);
?>