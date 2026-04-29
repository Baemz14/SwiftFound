<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Post Found Item Form</title>
    
    <script type="module">
        import { itemFormLoad } from "/swiftfound/script/item_form.js";
        window.onload = itemFormLoad;
    </script>
</head>
<body>
    <a href="/swiftfound/">frontpage</a>
    <a href="/swiftfound/home.php">home</a><br><br>

    <form method="POST" action="#" id="itemForm">
        <label for="title">Title:</label>
        <input type="text" id="title" name="title"><br><br>

        <label for="category">Category:</label>
        <select id="category">
            <option value="-1">Select a category</option>
        </select><br><br>

        <label for="description">Description:</label>
        <textarea id="description"></textarea><br><br>

        <label for="location">Location:</label>
        <input type="text" id="location"><br><br>

        <label for="img">upload img:</label>
        <input type="file" id="img" accept="image/*"><br><br>

        <label for="secret_question">Secret Question (for verification):</label>
        <input type="text" id="secret_question" placeholder="e.g., What color was it?"><br><br>

        <button type="submit">Submit</button>
    </form>
</body>
</html>