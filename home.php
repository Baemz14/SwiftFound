<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>

    <script type="module" src="script/home.js"></script>
    <script type="module">
        import { homeLoad } from "./script/home.js";
        window.onload = homeLoad;
    </script>
    <script type="module" src="/swiftfound/script/logout.js"></script>

</head>
<body>
    <a href="/swiftfound/">frontpage</a>
    <h1 id="welcome_text">Welcome to SwiftFound!</h1>
    <p id="rep_text">your reputation is: -1</p>
    <button type="button" onclick="logout()">logout</button>
</body>
</html>