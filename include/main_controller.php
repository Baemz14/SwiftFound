<?php
include '../db_stuff/db_conn.php';

function findUser($username, $password) {
    global $conn;
    $sql = "SELECT password_hash FROM User WHERE username = '$username'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        $hash = $row['password_hash'];
        return password_verify($password, $hash);
    } else {
        return false;
    }
}

function userExists($username) {
    global $conn;
    $sql = "SELECT user_id FROM User WHERE username = '$username'";
    $result = mysqli_query($conn, $sql);
    return mysqli_num_rows($result) > 0;
}

function addUser($username, $password) {
    global $conn;
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO User (username, password_hash) VALUES ('$username', '$passwordHash')";
    return mysqli_query($conn, $sql);
}

function getUserId($username) {
    global $conn;
    $sql = "SELECT user_id FROM User WHERE username = '$username'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row['user_id'];
    } else {
        return null;
    }
}

function getUser($user_id) {
    global $conn;
    $sql = "SELECT username, reputation FROM User WHERE user_id = '$user_id'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row;
    } else {
        return null;
    }
}

?>