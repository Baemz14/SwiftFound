<?php
include '../include/main_controller.php';
session_start();

// Admin auth gate
if (!isset($_SESSION['admin_auth']) || !$_SESSION['admin_auth']) {
    http_response_code(403);
    echo json_encode(['error_log' => 'unauthorized']);
    exit();
}

$response = ['error_log' => 'poop'];
$call_state = $_POST['call_state'] ?? $_GET['call_state'] ?? '';

switch ($call_state) {
    case 'GET_STATS':
        $response['stats'] = getAdminStats();
        break;

    case 'GET_REPORTS':
        $response['reports'] = getReports();
        break;

    case 'UPDATE_REPORT':
        $report_id = intval($_POST['report_id']);
        $new_status = $_POST['status'];
        $admin_note = $_POST['admin_note'] ?? '';
        $allowed = ['REVIEWING', 'RESOLVED', 'DISMISSED'];
        if (!in_array($new_status, $allowed)) {
            $response['is_success'] = false;
            $response['error_log'] = 'invalid status';
            break;
        }
        $response['is_success'] = updateReportStatus($report_id, $new_status, $admin_note);
        break;

    case 'REMOVE_ITEM':
        $item_id = intval($_POST['item_id'] ?? 0);
        if (!$item_id) {
            $response['is_success'] = false;
            $response['error_log'] = 'invalid item_id';
            break;
        }
        $response['is_success'] = removeItem($item_id);
        break;


    case 'GET_USERS':
        $response['users'] = getAllUsers();
        break;

    default:
        $response['error_log'] = 'state wong >:(';
}

header('Content-Type: application/json');
echo json_encode($response);
?>
