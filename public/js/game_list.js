const API_URL = "/api/games";

// Games Elements
const gameForm = document.getElementById("game-form");

const gamesList = document.getElementById("games-list");

const statusFilter = document.getElementById("status-filter");

let games = [];

// Games List
function setStatusBadgeHTML(status) {
    const statusClass = status.toLowerCase().replace(/\s+/g, "-");
    return `<span class="status-badge ${statusClass}">${status}</span>`;
}

async function fetchGames() {
    try {
        const selectedStatus = statusFilter.value;

        let url = `${API_URL}/games?status=${selectedStatus}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "same-origin",
        });

        if (!response.ok)
            throw new Error(error.message || "Failed to fetch games");

        games = await response.json();

        renderGames();
    } catch (error) {
        console.error("Error fetching games:", error);
        gamesList.innerHTML = `<p class="empty-state">Error loading games. Please try again!</p>`;
        showToast("Failed to load games!", "error");
    }
}

function renderGames() {
    gamesList.innerHTML = "";

    if (games.length === 0) {
        gamesList.innerHTML =
            '<p class="empty-state"> No games added yet. Add some!</p>';
        return;
    }

    games.forEach((game) => {
        const gameCard = document.createElement("div");
        gameCard.classList.add("game-card");
        gameCard.setAttribute("data-id", game.id);

        gameCard.innerHTML = `
        <h3>
            ${game.title} 
            <button class="delete-btn" data-id="${game.id}">Delete</button> 
        </h3> 
        
        ${setStatusBadgeHTML(game.status)}
        
        <p><strong>Platform:</strong> ${game.platform}</p>
        
        <p><strong>Added at:</strong> ${game.created_at}</p>

        <p><strong>Updated At:</strong> ${game.updated_at}</p>`;

        gamesList.appendChild(gameCard);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", handleDeleteGame);
    });
}

async function addGame(e) {
    e.preventDefault();

    const submitButton = gameForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Adding...";
    submitButton.disabled = true;

    const title = document.getElementById("title").value.trim();
    const platform = document.getElementById("platform").value.trim();
    const status = document.getElementById("status").value;

    const newGame = {
        title,
        platform,
        status,
    };

    try {
        const response = await fetch(`${API_URL}/games/new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGame),
        });

        if (!response.ok) throw new Error(`Failed to add game`);

        // Reset form
        gameForm.reset();

        // Refresh games list
        fetchGames();

        showToast("Game added successfully!", "success");
    } catch (error) {
        console.error("Error adding game:", error);
        showToast("Failed to add game. Please try again.", "error");
    } finally {
        // Restore button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

async function handleDeleteGame(e) {
    const button = e.target; // This is the correct reference
    button.disabled = true; // Disable the button to prevent multiple clicks

    const isConfirmed = await confirmAction(
        "Are you sure you want to delete this game?",
    );

    if (!isConfirmed) {
        button.disabled = false; // Re-enable the button if the user cancels
        return;
    }

    const gameId = button.getAttribute("data-id");

    try {
        const response = await fetch(`${API_URL}/games/${gameId}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete game");

        fetchGames(); // Refresh the game list after deletion

        showToast("Game successfully removed!", "success");
    } catch (error) {
        console.error("Error deleting game:", error);
        showToast("Failed to remove game. Please try again.", "error");
    } finally {
        button.disabled = false; // Re-enable the button once the process is complete
    }
}

gameForm.addEventListener("submit", addGame);
statusFilter.addEventListener("change", fetchGames);

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(`${API_URL}/get-username`);
        const data = await response.json();

        const usernameLabel = document.getElementById("username-label");

        if (data.username) {
            usernameLabel.innerHTML = `Welcome, ${data.username}! <button class="delete-btn" type="button" id="logout-btn">Log Out</button>`;

            const logoutButton = document.getElementById("logout-btn");
            logoutButton.addEventListener("click", async () => {
                try {
                    const logoutResponse = await fetch(`${API_URL}/logout`, {
                        method: "POST",
                        credentials: "same-origin", // Ensure session cookies are sent
                    });

                    if (logoutResponse.ok) {
                        // Redirect user to login page after successful logout
                        window.location.href = "/index.html";
                    } else {
                        alert("Error logging out.");
                    }
                } catch (error) {
                    console.error("Logout error:", error);
                    alert("Error logging out.");
                }
            });
        } else {
            usernameLabel.innerHTML = `<a href="/"> You're not logged in! </a>`;
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
});

fetchGames();
