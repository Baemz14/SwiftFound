<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Home</title>

    <link rel="stylesheet" href="css/browse.css">

    <script type="module">
        import { onBrowseLoad } from "/swiftfound/script/browse.js";
        window.onload = onBrowseLoad;
    </script>
</head>
<body>
    <a href="/swiftfound/">frontpage</a>
    <a href="/swiftfound/home.php">home</a>
    <a href="/swiftfound/login.php">login</a>
    
    <div id="listings_wrapper" class="listings-wrapper">
    </div>

    <dialog id="secretDialog">
        <p id="secretQuestionText">answer some question</p>
        <input type="text" id="answerText">
        <button id="cancelBtn">Cancel</button>
        <button id="submitBtn">Submit</button>
    </dialog>
</body>
</html>