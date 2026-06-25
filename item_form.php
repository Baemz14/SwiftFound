<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Post Found Item</title>
    
    <!-- Fonts and Separated CSS -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./css/itemform.css">
    
    <script type="module">
        import { itemFormLoad } from "./script/item_form.js";
        window.onload = itemFormLoad;
    </script>
</head>
<body>

    <div class="form-container">
        <div class="brand-name">SwiftFound</div>
        <a href="home.php" class="back-link">← Return to Home</a>

        <h2>Post Found Item</h2>
        <p class="subtitle">Please enter the item details</p>

        <form method="POST" action="#" id="itemForm">
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" name="title" placeholder="What did you find?">
            </div>

            <div class="form-group">
                <label for="category">Category</label>
                <select id="category" name="category">
                    <option value="-1">Select a category</option>
                </select>
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" placeholder="Describe the item..."></textarea>
            </div>

            <div class="form-group">
                <label for="location">Location</label>
                <input type="text" id="location" name="location" placeholder="Where was it found?">
            </div>

            <div class="form-group">
                <label for="img">Upload Image</label>
                <input type="file" id="img" name="img" accept="image/*">
            </div>

            <div class="form-group">
                <label for="secret_question">Secret Question (for verification)</label>
                <input type="text" id="secret_question" name="secret_question" placeholder="e.g., What color was it?">
            </div>

            <button type="submit">Submit Form</button>
        </form>
    </div>

</body>
</html>