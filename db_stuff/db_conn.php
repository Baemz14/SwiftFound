<?php
const DB_CONFIG_PATH = __DIR__ . '/db_config.json';
$json_string = file_get_contents(DB_CONFIG_PATH);
$db_config = json_decode($json_string, true);

$servername = $db_config['servername'];
$username = $db_config['username'];
$password = $db_config['password'];
$dbname = $db_config['dbname'];

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check if it worked
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>