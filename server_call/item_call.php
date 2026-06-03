<?php
include '../include/main_controller.php';
session_start();

$response = [
    'error_log' => "poop"
];

$call_state = $_POST['call_state'];
switch ($call_state) {
    case 'ALL_ITEMS':
        $response['items'] = getItems();
        break;
    
    case "GET_ITEM":
        if (isset($_POST['item_id'])) {
            $response['item'] = getItem($_POST['item_id']);
        } else if (isset($_GET['item_id'])) {
            $response['item'] = getItem($_GET['item_id']);
        } else {
            $response['error_log'] = "no item id passed";
        }
        break;

    case "UPLOAD":
        $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        if(!$user_id) {
            $response['error_log'] = "not logged in";
            break;
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

        $is_add_item_success = addItem(
            $user_id,
            $title,
            $category,
            $desc,
            $location,
            $filename,
            $secret_question
        );

        $response["upload_status"] = $is_upload_success? "success": "failed";
        $response["saved_as"] = $is_upload_success? $filename : null;
        break;

    case 'UPDATE_STATUS':
        $item_id = $_POST['item_id'];
        $new_status = $_POST['new_status'];
        if (updateItemStatus($item_id, $new_status)) {
            $response['is_success'] = true;
        } else {
            $response['is_success'] = false;
            $response['error_log'] = "controller errror";
        }
        break;

    case 'REPORT_ITEM':
        if (!isset($_SESSION['user_id']) || !isset($_POST['reported_item_id']) || !isset($_POST['reason']) || !isset($_POST['reported_user_id'])) {
            $response['is_success'] = false;
            $response['error_log'] = 'no enough data provided';
            break;
        }
        $reporter_id = $_SESSION['user_id'];
        $reported_item_id = $_POST['reported_item_id'];
        $reported_user_id = $_POST['reported_user_id'];
        $reason = $_POST['reason'];
        $details = $_POST['details'] ?? '';

        if (submitReport($reporter_id, $reported_user_id, $reported_item_id, $reason, $details)) {
            $response['is_success'] = true;
        } else {
            $response['is_success'] = false;
            $response['error_log'] = 'controller error';
        }
        break;

    case 'ITEM_CLAIMS':
        $response['claims'] = null;
        if (isset($_POST['item_id'])) {
            $response['claims'] = getItemClaims($_POST['item_id']);
        } else {
            $response['error_log'] = "no item id passed";
        }
        break;

    default:
        $response['error_log'] = "state wong >:(";
        break;
}

header('Content-Type: application/json');
echo json_encode($response);
?>