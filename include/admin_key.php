<?php
/**
 * admin_key.php
 * Generates and caches a random admin security key.
 * The key regenerates once per day and is stored in a flat file.
 */

define('ADMIN_KEY_FILE', __DIR__ . '/../db_stuff/admin_key_store.txt');

function getAdminKey(): string {
    // Ensure the storage directory exists
    if (!is_dir(dirname(ADMIN_KEY_FILE))) {
        mkdir(dirname(ADMIN_KEY_FILE), 0700, true);
    }

    // Read cached key and its generation timestamp
    if (file_exists(ADMIN_KEY_FILE)) {
        $raw = file_get_contents(ADMIN_KEY_FILE);
        [$timestamp, $key] = explode('|', $raw, 2) + [null, null];

        // Reuse the key if it was generated today
        if ($timestamp && $key && date('Y-m-d', (int)$timestamp) === date('Y-m-d')) {
            return trim($key);
        }
    }

    // Generate a new key: 3 groups of 4 uppercase alphanumeric chars e.g. A3F2-XK91-7BPQ
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
    $groups = [];
    for ($g = 0; $g < 3; $g++) {
        $part = '';
        for ($i = 0; $i < 4; $i++) {
            $part .= $chars[random_int(0, strlen($chars) - 1)];
        }
        $groups[] = $part;
    }
    $newKey = implode('-', $groups);

    // Persist: timestamp|key
    file_put_contents(ADMIN_KEY_FILE, time() . '|' . $newKey, LOCK_EX);

    return $newKey;
}
?>
