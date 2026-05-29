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
    $sql = "SELECT item.*, claim.* FROM item, claim, user WHERE claim.item_id = item.item_id AND claim.user_id = user.user_id AND user.user_id = '$user_id'";
    $result = mysqli_query($conn, $sql);
    $claims = array();
    while($row = mysqli_fetch_assoc($result)) {
        $claims[] = $row;
    }
    return $claims;
}

function getUserItemClaimed($user_id) {
    global $conn;
    $sql = "SELECT 
                c.*,
                i.secret_question, i.title, i.description AS item_description, i.img_file AS item_image, i.user_id AS poster_id,
                claimer.username AS claimer_name,
                poster.username AS poster_name
            FROM claim c
            INNER JOIN item i ON c.item_id = i.item_id
            INNER JOIN user claimer ON c.user_id = claimer.user_id
            INNER JOIN user poster ON i.user_id = poster.user_id
            WHERE i.user_id = '$user_id'";

    $result = mysqli_query($conn, $sql);
    $claims = array();

    while($row = mysqli_fetch_assoc($result)) {
        $row['item'] = [
            'item_id' => $row['item_id'],
            'title' => $row['title'],
            'description' => $row['item_description'],
            'secret_question' => $row['secret_question'],
            'img_file' => $row['item_image'],
            'user_id' => $row['poster_id']
        ];
        
        $row['claimer'] = [
            'user_id' => $row['user_id'],
            'username' => $row['claimer_name']
        ];
        
        $row['poster'] = [
            'user_id' => $row['poster_id'],
            'username' => $row['poster_name']
        ];
        
        $claims[] = $row;
    }

    return $claims;
}

function addChat(
    $sender_id, $reciever_id,
    $text, $claim_id
) {
    global $conn;
    $sql = "
        INSERT INTO message (
            claim_id, sender_id, reciever_id, message_content
        ) VALUES (
            '$claim_id', '$sender_id', '$reciever_id', '$text'
        )
    ";
    return mysqli_query($conn, $sql);
}

function updateClaimStatus($claim_id, $status) {
    global $conn;
    $sql = "UPDATE claim SET claim_status = '$status' WHERE claim_id = '$claim_id'";
    return mysqli_query($conn, $sql);
}

function getUserChat($user_id) {
    global $conn;
    $sql = "SELECT 
                m.*,
                sender.username AS sender_name,
                sender.avatar_url AS sender_avatar,
                sender.reputation AS sender_reputation,
                
                reciever.username AS reciever_name,
                reciever.avatar_url AS reciever_avatar,
                reciever.reputation AS reciever_reputation,

                item.item_id AS item_id,
                item.title AS item_title,
                item.img_file AS item_img,

                claim.user_id AS claimer_id
            FROM message m
            INNER JOIN user sender ON m.sender_id = sender.user_id
            INNER JOIN user reciever ON m.reciever_id = reciever.user_id
            INNER JOIN claim ON m.claim_id = claim.claim_id
            INNER JOIN item ON claim.item_id = item.item_id
            WHERE m.sender_id = '$user_id' OR m.reciever_id = '$user_id'
            ORDER BY m.sent_at ASC";

    $result = mysqli_query($conn, $sql);
    $chats = array();
    while($row = mysqli_fetch_assoc($result)) {
        $row['sender'] = [
            'user_id' => $row['sender_id'],
            'username' => $row['sender_name'],
            'avatar_url' => $row['sender_avatar'],
            'reputation' => $row['sender_reputation']
        ];
        $row['reciever'] = [
            'user_id' => $row['reciever_id'],
            'username' => $row['reciever_name'],
            'avatar_url' => $row['reciever_avatar'],
            'reputation' => $row['reciever_reputation']
        ];
        $row['item'] = [
            'item_id' => $row['item_id'],
            'item_title' => $row['item_title'],
            'item_img' => $row['item_img']
        ];
        
        $chats[] = $row;
    }

    return $chats;
}

function setChatsRead($chat_ids) {
    global $conn;
    $id_string = implode(',', $chat_ids);
    $sql = "UPDATE message SET is_read = 1 WHERE message_id IN ($id_string)";
    return mysqli_query($conn, $sql) > 0;
}
?>