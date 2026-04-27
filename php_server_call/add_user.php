<?php
include '../include/main_controller.php';

$username = $_POST['uname'];
$password = $_POST['pass'];

$response = [
    'is_added' => 'no',
    'error_log' => 'User already exists'
];

$is_user_exist = userExists($username);
if (!$is_user_exist) {
    $result = addUser($username, $password);
    if ($result) {
        $response['is_added'] = 'yes';
        $response['error_log'] = 'User added successfully';
    }
    else {
        $response['error_log'] = 'Failed to add user for some reason :/';
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>