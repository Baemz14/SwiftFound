<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound Chat Mockup</title>
    <link rel="stylesheet" href="css/chat.css">

    <script type="module">
        import { chatLoad } from '/swiftfound/script/chat.js';
        window.onload = chatLoad;
    </script>
</head>
<body>

    <nav class="top-navbar">
        <div class="logo-area">
            <a href="index.php">SwiftFound</a>
        </div>
        <div class="nav-links">
            <a href="home.php">Home</a>
            <a href="browse.php">Browse</a>
        </div>
    </nav>

    <div class="main-wrapper">
        <div class="sidebar">
            <div class="sidebar-header">Messages</div>
            <div id="contactCont" class="contact-list">

            </div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
            <div id="chatCont" style="flex: 1; display: flex; flex-direction: column; height: 100%; min-height: 0;">

            </div>           
            <div class="chat-input-area">
                <input id="messageTxt" type="text" placeholder="Type a message..." aria-label="Message text inputs">
                <button id="sendBtn" type="button">Send</button>
            </div>         
        </div>
    </div>

</body>
</html>