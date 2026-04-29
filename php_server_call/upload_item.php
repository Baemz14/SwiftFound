<?php
include '../include/main_controller.php';

$upload_destination = "../img_upload/";
$basename = $_FILES['item_img']['name'];
$filename = time() . "_" . $basename;

$item_title = $_POST['item_title'];
$tmp_loc = $_FILES['item_img']['tmp_name'];

$is_upload_success = move_uploaded_file($tmp_loc, $upload_destination . $filename);

$response = [
    "upload_status" => $is_upload_success? "success": "failed",
    "saved_as" => $is_upload_success? $filename : null
];

header('Content-Type: application/json');
echo json_encode($response);
?>