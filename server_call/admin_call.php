<?php
include '../include/main_controller.php';
session_start();

$call_state = $_POST['call_state'] ?? $_GET['call_state'] ?? '';

// Admin auth gate
if ((!isset($_SESSION['admin_auth']) || !$_SESSION['admin_auth']) && $call_state != 'GET_STATS') {
    http_response_code(403);
    echo json_encode(['error_log' => 'unauthorized']);
    exit();
}

$response = ['error_log' => 'poop'];

switch ($call_state) {
    case 'GET_STATS':
        $response['stats'] = getAdminStats();
        break;

    case 'GET_REPORTS':
        $response['reports'] = getReports();
        break;

    case 'GET_REPORT':
        $response['report'] = null;
        if (isset($_POST['report_id'])) {
            $report = getReport($_POST['report_id']);
            if ($report) {
                $response['report'] = $report;
            } else {
                $response['error_log'] = 'no report found';
            }
        } else {
            $response['error_log'] = 'no report id provided';
        }
        break;

    case 'UPDATE_REPORT_STATUS':
        if (!isset($_POST['report_id']) || !isset($_POST['status'])) {
            $response['is_success'] = false;
            $response['error_log'] = 'not enough data provided';
            break;
        } if (updateReportStatus($_POST['report_id'], $_POST['status'])) {
            $response['is_success'] = true;
        } else {
            $response['is_success'] = false;
            $response['error_log'] = 'controller error';
        }
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

    case 'USER_RESTRICT_UPDATE':
        $response['is_success'] = false;
        if (!isset($_POST['user_id']) || !isset($_POST['is_restricted'])) {
            $response['error_log'] = 'not enough param passed';
            break;
        } if (userRestrictUpdate($_POST['user_id'], $_POST['is_restricted'])) {
            $response['is_success'] = true;
        } else {
            $response['error_log'] = 'controller error';
        }
        break;

    default:
        $response['error_log'] = 'state wong >:(';
}

header('Content-Type: application/json');
echo json_encode($response);
?>
