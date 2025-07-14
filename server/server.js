const express = require("express");
const session = require("express-session");
const cors = require("cors");
const crypto = require("crypto");

const path = require("path");

require("dotenv").config();

// Import routes
const gamesRoutes = require("./routes/games");

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(
    session({
        secret: crypto.randomBytes(64).toString("hex"),
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if using HTTPS
    }),
);

// API Routes
app.use("/api/games", gamesRoutes);

// Serve the frontend for any other route
app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
