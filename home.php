<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>

    <script type="module">
        import { homeLoad } from "./script/home.js";
        window.onload = homeLoad;
    </script>
</head>
<body>
    <a href="/swiftfound/">frontpage</a>
    <h1 id="welcome_text">Welcome to SwiftFound!</h1>
    <p id="rep_text">your reputation is: -1</p>
    <p id="posted_count">youve posted -1 items</p>
    <button type="button" id="logoutButton">logout</button>
    <a href="/swiftfound/item_form.php">post found item</a>
</body>
</html>