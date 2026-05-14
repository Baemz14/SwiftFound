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

function ensureUserAvatarColumn() {
    global $conn;
    $sql = "ALTER TABLE User ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT NULL";
    return mysqli_query($conn, $sql);
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
    ensureUserAvatarColumn();
    $sql = "SELECT user_id, username, reputation, avatar_url FROM User WHERE user_id = '$user_id'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row;
    } else {
        return null;
    }
}

function updateUserAvatar($user_id, $avatar_url) {
    global $conn;
    ensureUserAvatarColumn();
    $sql = "UPDATE User SET avatar_url = '$avatar_url' WHERE user_id = '$user_id'";
    return mysqli_query($conn, $sql);
}

function addItem(
    $user_id,
    $title,
    $category,
    $desc,
    $location,
    $img_file,
    $secret_question
) {
    global $conn;
    $sql = "INSERT INTO Item (
        user_id, 
        title, 
        category, 
        description, 
        location, 
        img_file, 
        secret_question
    ) VALUES (
        '$user_id', 
        '$title', 
        '$category', 
        '$desc', 
        '$location', 
        '$img_file', 
        '$secret_question'
    )";
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
    $sql = "INSERT INTO Claim (user_id, item_id, answer_text) 
        VALUES ('$user_id', '$item_id', '$answer_text')";
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