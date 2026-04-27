async function callServer(server_url, formData) {
    let response = await fetch(server_url, {
        method: 'POST',
        body: formData
    });

    let contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        let error_text = await response.text();
        throw new Error("Server error: " + error_text);
    }
}