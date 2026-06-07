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
    $sql = "SELECT user_id, username, reputation, avatar_url, is_restricted FROM User WHERE user_id = '$user_id'";
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
    $sql = "SELECT item.*, user.user_id, user.username, user.reputation FROM item, user WHERE item.user_id = user.user_id AND item.status != 'REMOVED'";
    $result = mysqli_query($conn, $sql);

    $items = array();
    while($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }
    
    return $items;
}

function getItem($item_id) {
    global $conn;
    $sql = "SELECT item.*, user.username, user.reputation FROM item, user WHERE item.user_id = user.user_id AND item.item_id = '$item_id' AND item.status != 'REMOVED'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {
        return mysqli_fetch_assoc($result);
    }
    
    return null;
}

function getClaim($claim_id) {
    global $conn;
    $sql = "SELECT claim.*, item.title, item.img_file, user.username 
        FROM claim, item, user 
        WHERE claim.claim_id = '$claim_id' AND 
            claim.item_id = item.item_id AND 
            claim.user_id = user.user_id";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {
        return mysqli_fetch_assoc($result);
    }
    
    return null;
}

function addClaim($user_id, $item_id, $answer_text) {
    global $conn;
    $sql = "INSERT INTO Claim (user_id, item_id, answer_text)
            VALUES ('$user_id', '$item_id', '$answer_text')";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        return null;
    }
    
    $new_id = mysqli_insert_id($conn);
    $claim = getClaim($new_id);
    if ($claim) {
        return $claim;
    }
    return null;
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

function confirmClaimOwner($claim_id) {
    global $conn;
    $sql = "UPDATE claim SET claim_status = 'OWNER_CONFIRM' WHERE claim_id = '$claim_id'";
    if (!mysqli_query($conn, $sql)) {
        return false;
    }
    $sql = "UPDATE claim SET claim_status = 'REJECTED' 
        WHERE claim_id != '$claim_id' 
            AND item_id = (SELECT item_id FROM claim WHERE claim_id = '$claim_id') AND claim_status = 'CHATTING'";
    return mysqli_query($conn, $sql);
}

function posterResolveClaim($claim_id) {
    global $conn;
    $sql = "UPDATE claim SET claim_status = 'PENDING_RESOLUTION' WHERE claim_id = '$claim_id'";
    if (!mysqli_query($conn, $sql)) {
        return false;
    }
    $sql = "UPDATE claim SET claim_status = 'REJECTED' 
        WHERE claim_id != '$claim_id' 
            AND item_id = (SELECT item_id FROM claim WHERE claim_id = '$claim_id') AND claim_status = 'CHATTING'";
    return mysqli_query($conn, $sql);
}

function confirmResolution($claim_id) {
    global $conn;
    $sql = "UPDATE claim SET claim_status = 'RESOLVED' WHERE claim_id = '$claim_id'";
    if (!mysqli_query($conn, $sql)) {
        return false;
    }
    $sql = "UPDATE item SET status = 'RESOLVED' WHERE item_id = (SELECT item_id FROM claim WHERE claim_id = '$claim_id')";
    return mysqli_query($conn, $sql);
}

function resolveClaim($claim_id) {
    global $conn;
    $sql = "UPDATE claim SET claim_status = 'RESOLVED' WHERE claim_id = '$claim_id'";
    if (!mysqli_query($conn, $sql)) {
        return false;
    }
    $sql = "UPDATE claim SET claim_status = 'REJECTED' 
        WHERE claim_id != '$claim_id' 
            AND item_id = (SELECT item_id FROM claim WHERE claim_id = '$claim_id') AND claim_status = 'CHATTING'";
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

                claim.user_id AS claimer_id,
                claim.claim_id AS claim_id,
                claim.claim_status AS claim_status
            FROM message m
            INNER JOIN user sender ON m.sender_id = sender.user_id
            INNER JOIN user reciever ON m.reciever_id = reciever.user_id
            INNER JOIN claim ON m.claim_id = claim.claim_id
            INNER JOIN item ON claim.item_id = item.item_id
            WHERE (m.sender_id = '$user_id' OR m.reciever_id = '$user_id')
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
        $row['claim'] = [
            'claim_id' => $row['claim_id'],
            'claimer_id' => $row['claimer_id'],
            'claim_status' => $row['claim_status']
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

function updateItemStatus($item_id, $status) {
    global $conn;
    if ($status == 'ABANDONED') {
        $sql = "UPDATE report SET status = 'DISMISSED'
            WHERE reported_item_id = '$item_id'";
        if (!mysqli_query($conn, $sql)) {
            return false;
        }
    }
    $sql = "UPDATE item SET status = '$status' WHERE item_id = '$item_id'";
    return mysqli_query($conn, $sql);
}

function removeItem($item_id) {
    global $conn;
    $item_id = (int)$item_id;
    $sql = "UPDATE item SET status = 'REMOVED' WHERE item_id = $item_id";
    if (!mysqli_query($conn, $sql)) {
        return false;
    }
    $sql = "UPDATE report
        INNER JOIN item ON item.item_id = report.reported_item_id
        SET report.status = 'ACCEPTED'
        WHERE item.item_id = $item_id";
    return mysqli_query($conn, $sql);
}

function submitReport($reporter_id, $reported_user_id, $reported_item_id, $reason, $details) {
    global $conn;
    $reason = mysqli_real_escape_string($conn, $reason);
    $details = mysqli_real_escape_string($conn, $details);
    $sql = "INSERT INTO report (reporter_id, reported_user_id, reported_item_id, reason, details) 
            VALUES ($reporter_id, $reported_user_id, $reported_item_id, '$reason', '$details')";
    return mysqli_query($conn, $sql);
}

function getAdminStats() {
    global $conn;
    $stats = [];

    $r = mysqli_query($conn, "SELECT COUNT(*) AS c FROM user");
    $stats['total_users'] = mysqli_fetch_assoc($r)['c'];

    $r = mysqli_query($conn, "SELECT COUNT(*) AS c FROM item");
    $stats['total_items'] = mysqli_fetch_assoc($r)['c'];

    $r = mysqli_query($conn, "SELECT COUNT(*) AS c FROM item WHERE status = 'RESOLVED'");
    $stats['resolved_items'] = mysqli_fetch_assoc($r)['c'];

    $r = mysqli_query($conn, "SELECT COUNT(*) AS c FROM claim");
    $stats['total_claims'] = mysqli_fetch_assoc($r)['c'];

    $r = mysqli_query($conn, "SELECT COUNT(*) AS c FROM message");
    $stats['total_messages'] = mysqli_fetch_assoc($r)['c'];

    $r = mysqli_query($conn, "SELECT COUNT(*) AS c FROM report WHERE status = 'PENDING'");
    $stats['pending_reports'] = mysqli_fetch_assoc($r)['c'];

    $r = mysqli_query($conn, "SELECT COUNT(*) AS c FROM report");
    $stats['total_reports'] = mysqli_fetch_assoc($r)['c'];

    // Claim status breakdown
    $r = mysqli_query($conn, "SELECT claim_status, COUNT(*) AS c FROM claim GROUP BY claim_status");
    $stats['claim_breakdown'] = [];
    while ($row = mysqli_fetch_assoc($r)) {
        $stats['claim_breakdown'][$row['claim_status']] = $row['c'];
    }

    return $stats;
}

function getReport($report_id) {
    global $conn;
    $sql = "SELECT r.*,
                reporter.username AS reporter_name,
                reported_u.username AS reported_username,
                i.title AS reported_item_title,
                i.status AS item_status
            FROM report r
            INNER JOIN user reporter ON r.reporter_id = reporter.user_id
            LEFT JOIN user reported_u ON r.reported_user_id = reported_u.user_id
            LEFT JOIN item i ON r.reported_item_id = i.item_id
            WHERE r.report_id = '$report_id'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        return mysqli_fetch_assoc($result);
    } return null;
}

function getReports() {
    global $conn;
    $sql = "SELECT r.*,
                reporter.username AS reporter_name,
                reported_u.username AS reported_username,
                i.title AS reported_item_title,
                i.status AS item_status
            FROM report r
            INNER JOIN user reporter ON r.reporter_id = reporter.user_id
            LEFT JOIN user reported_u ON r.reported_user_id = reported_u.user_id
            LEFT JOIN item i ON r.reported_item_id = i.item_id
            ORDER BY r.created_at ASC";
    $result = mysqli_query($conn, $sql);
    $reports = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $reports[] = $row;
    }
    return $reports;
}

function updateReportStatus($report_id, $status) {
    global $conn;
    $status_escaped = mysqli_real_escape_string($conn, $status);
    $sql = "UPDATE report SET status = '$status_escaped' WHERE report_id = '$report_id'";
    return mysqli_query($conn, $sql);
}

function getAllUsers() {
    global $conn;
    $sql = "SELECT user_id, username, reputation, is_restricted,
                (SELECT COUNT(*) FROM item WHERE item.user_id = user.user_id) AS item_count,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id) AS claim_count,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id AND claim_status = 'RESOLVED') AS resolved_claims,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id AND claim_status = 'OWNER_CONFIRM') AS owner_confirmed_claims,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id AND claim_status = 'PENDING') AS pending_claims,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id AND claim_status = 'REJECTED') AS rejected_claims,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id AND claim_status = 'CHATTING') AS chatting_claims,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id AND claim_status = 'PENDING_RESOLUTION') AS pending_resolution_claims,
                (SELECT COUNT(*) FROM claim WHERE claim.user_id = user.user_id AND claim_status = 'CANCELED') AS canceled_claims
            FROM user ORDER BY user_id DESC";
    $result = mysqli_query($conn, $sql);
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
    return $users;
}

function getItemClaims($item_id) {
    global $conn;
    $sql = "SELECT 
                c.*,
                u.*
            FROM claim c
            INNER JOIN user u ON c.user_id = u.user_id
            WHERE c.item_id = '$item_id'";
    $result = mysqli_query($conn, $sql);
    $claims = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $claims[] = $row;
    }
    return $claims;
}

function updateUserReputation($user_id, $delta) {
    global $conn;
    $sql = "UPDATE user SET reputation = reputation + '$delta' WHERE user_id = '$user_id'";
    return mysqli_query($conn, $sql);
}

function userRestrictUpdate($user_id, $is_restricted) {
    global $conn;
    $is_restricted = filter_var($is_restricted, FILTER_VALIDATE_BOOLEAN);
    $restrict_token = $is_restricted? 1: 0;
    $sql = "UPDATE user SET is_restricted = '$restrict_token' WHERE user_id = '$user_id'";
    return mysqli_query($conn, $sql);
}
?>