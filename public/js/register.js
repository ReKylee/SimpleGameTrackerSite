const API_URL = "/api/games";

// Registration Elements
const registrationForm = document.getElementById("login-form");

async function addUser(e) {
    e.preventDefault();

    const submitButton = registrationForm.querySelector(
        'button[type="submit"]',
    );

    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Registering...";

    submitButton.disabled = true;

    try {
        const formData = new FormData(registrationForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Set header for JSON data
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(errorMessage.message || "Registration failed");
        }

        showToast("Registration successful!", "success");

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
registrationForm.addEventListener("submit", addUser);
