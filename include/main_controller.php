<?php
include '../db_stuff/db_conn.php';

function findUser($username, $password) {
    global $conn;
    $sql = "SELECT * FROM User WHERE username = '$username'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        $hash = $row['password_hash'];
        if(password_verify($password, $hash)) {
            return $row;
        }
    }
    return null;
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
    $sql = "SELECT user_id, username, reputation FROM User WHERE user_id = '$user_id'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row;
    } else {
        return null;
    }
}

function addItem(
    $user_id,
    $title,
    $category,
    $desc,
    $location,
    $img_file,
    $secret_question,
    $created_at,
    $foundOrLost
) {
    global $conn;
    $sql = "INSERT INTO Item (
        user_id, 
        title, 
        category, 
        description, 
        location, 
        img_file, 
        secret_question, 
        created_at, 
        found_or_lost
    ) VALUES (
        '$user_id', 
        '$title', 
        '$category', 
        '$desc', 
        '$location', 
        '$img_file', 
        '$secret_question', 
        '$created_at', 
        '$foundOrLost')";
    return mysqli_query($conn, $sql);
}

function getUserItems($user_id) {
    global $conn;
    $sql = "SELECT * FROM item WHERE user_id = '$user_id'";
    $result = mysqli_query($conn, $sql);

    $items = array();
    while($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    
    return $items;
}

function getItems() {
    global $conn;
    $sql = "SELECT item.*, user.user_id, user.username, user.reputation FROM item, user WHERE item.user_id = user.user_id";
    $result = mysqli_query($conn, $sql);

    $items = array();
    while($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    
    return $items;
}

function getItem($item_id) {
    global $conn;
    $sql = "SELECT item.*, user.username, user.reputation FROM item, user WHERE item.user_id = user.user_id and item.item_id = '$item_id'";
    $result = mysqli_query($conn, $sql);

    $items = array();

    if (mysqli_num_rows($result) > 0) {
        return mysqli_fetch_assoc($result);
    }
    
    return null;
}

function addClaim($user_id, $item_id, $answer_text) {
    global $conn;
    $sql = "INSERT INTO Claim (user_id, item_id, answer_text, is_approved) 
        VALUES ('$user_id', '$item_id', '$answer_text', 0)";
    return mysqli_query($conn, $sql);
}

function getUserItemClaims($user_id) {
    global $conn;
    $sql = "SELECT item.* FROM item, claim, user WHERE claim.item_id = item.item_id AND claim.user_id = user.user_id AND user.user_id = '$user_id'";
    $result = mysqli_query($conn, $sql);
    $items = array();
    while($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    return $items;
}

function getUserItemClaimed($user_id) {
    global $conn;
    $sql = "SELECT item.* FROM item, claim, user WHERE claim.item_id = item.item_id AND item.user_id = user.user_id AND user.user_id = '$user_id'";
    $result = mysqli_query($conn, $sql);
    $items = array();
    while($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    return $items;
}
?>