function showToast(message, type = "info") {
    // Define Catppuccin Mocha color scheme
    const catppuccinColors = {
        info: "#89b4fa", // Sapphire (Blue)
        success: "#a6e3a1", // Green
        warning: "#f9e2af", // Yellow
        error: "#f38ba8", // Red
    };

    Toastify({
        text: message,
        duration: 3000, // 3 seconds
        close: true,
        gravity: "top", // Toast position: "top" or "bottom"
        position: "center", // "left", "center", "right"
        stopOnFocus: true, // Prevents dismissing on hover
        style: {
            background: catppuccinColors[type] || catppuccinColors.info,
            color: "#1e1e2e", // Text color (Dark)
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "16px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        },
    }).showToast();
}
function confirmAction(message) {
    return new Promise((resolve) => {
        const toast = Toastify({
            text: `
            <div style="
            text-align: center;
            font-size: 16px;
            color: #cdd6f4;
            font-weight: 500;
            padding-bottom: 10px;
            ">${message}</div>
            <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="confirm-yes" class="delete-btn">Yes</button>
            <button id="confirm-no" class="delete-btn">No</button>
            </div>
            `,
            duration: -1, // Keep it open until user clicks
            close: false, // No close button
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            escapeMarkup: false, // Allows HTML inside the toast
            style: {
                background: "#1e1e2e", // Catppuccin Mocha Surface
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                width: "250px", // Make it compact
            },
        }).showToast();

        // Wait for buttons to be added to DOM
        setTimeout(() => {
            const yesButton = document.getElementById("confirm-yes");
            const noButton = document.getElementById("confirm-no");

            yesButton.onclick = () => {
                toast.hideToast();
                resolve(true);
            };

            noButton.onclick = () => {
                toast.hideToast();
                resolve(false);
            };
        }, 100); // Delay to ensure elements exist
    });
}
