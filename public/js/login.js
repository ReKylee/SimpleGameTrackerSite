const API_URL = "/api/games";

// Login Elements
const loginForm = document.getElementById("login-form");

async function loginUser(e) {
    e.preventDefault();

    const submitButton = loginForm.querySelector('button[type="submit"]');

    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Logging in...";

    submitButton.disabled = true;

    try {
        const formData = new FormData(loginForm);

        const password = formData.get("password");
        const username = formData.get("username");

        const response = await fetch(`${API_URL}/${username}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Set header for JSON data
            },
            body: JSON.stringify({ password }), // Only send password in body
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(errorMessage.message || "Registration failed");
        }

        showToast("Login successful!", "success");

        window.location.href = "/games.html";
    } catch (error) {
        showToast(
            error.message || "Registration failed. Please try again!",
            "error",
        );
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}
loginForm.addEventListener("submit", loginUser);
