<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include '../include/main_controller.php';
session_start();

$response = [
    'error_log' => "poop"
];

$call_state = $_POST['call_state'];
switch ($call_state) {
    case "USER_EXIST":
        $username = $_POST['uname'];
        $response['is_user_exist'] = userExists($username)? "true": "false";
        break;

    case "ADD_USER":
        $username = $_POST['uname'];
        $password = $_POST['pass'];
        if (!userExists($username)) {
            if (addUser($username, $password)) {
                $response['user'] = findUser($username, $password);
                $response['is_added'] = "yes";
                $response['error_log'] = 'User added successfully';
            } else {
                $response['is_added'] = "no";
                $response['error_log'] = "controller error";
            }
        } else {
            $response['is_added'] = "no";
            $response['error_log'] = "username already exist";
        }
        break;

    case "FIND_USER":
        $username = $_POST['uname'];
        $password = $_POST['pass'];
        $user = findUser($username, $password);
        if ($user) {
            $response['status'] = "success";
            $response['user_id'] = $user['user_id'];
            $response['error_log'] = "found user";
        } else {
            $response['status'] = "failed";
            $response['user_id'] = null;
            $response['error_log'] = "user not found";
        }
        break;

    case "LOGIN":
        $user_id = $_POST['user_id'];
        if ($user_id) {
            $_SESSION['user_id'] = $user_id;
            $response['status'] = "success";
        } else {
            $response['status'] = "failed";
            $response['error_log'] = "no user id passed";
        }
        break;

    case "GET_SESSDATA": 
        $response['is_logged_in'] = isset($_SESSION['user_id']);
        $response['user_id'] = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null; // obsolete but old code uses
        $response['user'] = isset($_SESSION['user_id']) ? getUser($_SESSION['user_id']) : null;
        break;

    case "LOGOUT":
        $_SESSION = array();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        $response['status'] = "success";
        break;

    case "USER_ITEMS":
        $user_id = isset($_SESSION['user_id'])? $_SESSION['user_id']: null;
        if (!$user_id) {
            die("you no login dada");
        }
        $response['items'] = getUserItems($user_id);
        break;
    
    case "USER_CLAIMS":
        $user_id = isset($_SESSION['user_id'])? $_SESSION['user_id']: null;
        if (!$user_id) {
            $response['claims'] = [];
            $response['error_log'] = "not logged in";
        } else {
            $response['claims'] = getUserItemClaims($user_id);
        }
        break;

    case 'USER_CLAIM_REQ':
    case "USER_CLAIMED": // dont like name
        $user_id = isset($_SESSION['user_id'])? $_SESSION['user_id']: null;
        if (!$user_id) {
            die("you no login dada");
        }
        $response['claim_req'] = getUserItemclaimed($user_id);
        break;

    case "GET_USER":
        $user_data = isset($_SESSION['user_id']) ? getUser($_SESSION['user_id']) : null;
        if (!$user_data) {
            $response['user_id'] = null;
        } else {
            $response['user_id'] = $_SESSION['user_id'];
        }
        $response['username'] = $user_data ? $user_data['username'] : null;
        $response['reputation'] = $user_data ? $user_data['reputation'] : null;
        $response['avatar_url'] = $user_data && isset($user_data['avatar_url']) ? $user_data['avatar_url'] : null;
        $response['is_restricted'] = $user_data ? $user_data['is_restricted'] : null;
        $response['user'] = $user_data;
        break;

    case "UPLOAD_AVATAR":
        $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        if (!$user_id) {
            $response['status'] = 'failed';
            $response['message'] = 'Not logged in.';
            break;
        }

        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            $response['status'] = 'failed';
            $response['message'] = 'Please choose a valid image file.';
            break;
        }

        $avatar = $_FILES['avatar'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
        $fileType = mime_content_type($avatar['tmp_name']);
        $extension = strtolower(pathinfo($avatar['name'], PATHINFO_EXTENSION));

        if (!in_array($fileType, $allowedTypes) || !in_array($extension, $allowedExts)) {
            $response['status'] = 'failed';
            $response['message'] = 'Only JPG, PNG, or WEBP images are allowed.';
            break;
        }

        $uploadDir = dirname(__DIR__) . '/img_upload/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $newFilename = time() . '_avatar_' . $user_id . '.' . $extension;
        $destination = $uploadDir . $newFilename;

        if (!move_uploaded_file($avatar['tmp_name'], $destination)) {
            $response['status'] = 'failed';
            $response['message'] = 'Unable to save the uploaded image.';
            break;
        }

        $avatarUrl = '/swiftfound/img_upload/' . $newFilename;
        if (updateUserAvatar($user_id, $avatarUrl)) {
            $response['status'] = 'success';
            $response['avatar_url'] = $avatarUrl;
        } else {
            $response['status'] = 'failed';
            $response['message'] = 'Unable to update profile image.';
        }
        break;

    case 'USER_CHAT':
        if (!isset($_SESSION['user_id'])) {
            $response['error_log'] = "no login";
            $response['chats'] = [];
            break;
        }
        $user_id = $_SESSION['user_id'];
        $response['chats'] = getUserChat($user_id);
        break;

    case 'UPDATE_REPUTATION':
        if (!isset($_POST['user_id']) || !isset($_POST['change'])) {
            $response['error_log'] = "missing required parameters";
            $response['is_success'] = false;
            break;
        }
        $user_id = $_POST['user_id'];
        $change = intval($_POST['change']);
        if (updateUserReputation($user_id, $change)) {
            $response['is_success'] = true;
            $response['updated_user'] = getUser($user_id);
        } else {
            $response['is_success'] = false;
            $response['error_log'] = "unable to update reputation";
        }
        break;

    default:
        $response['error_log'] = "state wong >:(";
}

header('Content-Type: application/json');
echo json_encode($response);
?>