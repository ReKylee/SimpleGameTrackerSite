const express = require("express");
const router = express.Router();
const db = require("../database/database");
const argon2 = require("argon2");

router.get("/get-username", (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user });
    } else {
        res.json({ username: null });
    }
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hash = await argon2.hash(password);

        const [result] = await db.query(
            `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
            [username.trim(), email.trim(), hash],
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to register user" });
        }

        const [user] = await db.query(`SELECT LAST_INSERT_ID() AS id`);

        req.session.user = username.trim();
        req.session.userId = user[0].id;

        res.status(201).json({ username });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res
                .status(400)
                .json({ message: "Username already exists!" });
        }

        console.error("Error registering user:", error);

        res.status(500).json({ message: "Server error" });
    }
});

router.post("/:username", async (req, res) => {
    const { username } = req.params;
    const { password } = req.body;
    try {
        const [user] = await db.query(
            "SELECT id, password_hash FROM users WHERE username = ?",
            [username],
        );

        if (user.length === 0) {
            return res.status(400).json({ message: "Invalid username" });
        }

        const { id, password_hash } = user[0];

        const validPassword = await argon2.verify(password_hash, password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        req.session.user = username;
        req.session.userId = id;

        res.json({ message: "Login successful", username });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Failed to log out" });
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
});

router.get("/games", async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not logged in" });
        }

        const { status } = req.query;
        let query =
            "SELECT id, title, status, platform, created_at, updated_at FROM games WHERE user_id = ?";
        let queryParams = [userId];

        if (status && status !== "All") {
            query += " AND status = ?";
            queryParams.push(status);
        }

        query += " ORDER BY created_at DESC";

        const [rows] = await db.query(query, queryParams);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching games by status:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/games/new", async (req, res) => {
    const { title, platform, status } = req.body;

    try {
        const [result] = await db.query(
            "INSERT INTO games (user_id, title, platform, status) VALUES (?, ?, ?, ?)",
            [req.session.userId, title, platform, status],
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to insert game" });
        }

        const [rows] = await db.query(
            "SELECT title, status, platform, created_at, updated_at FROM games WHERE id = LAST_INSERT_ID()",
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("Error adding game:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete("/games/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    if (!id) {
        return res.status(400).json({ message: "Game ID is required" });
    }

    if (!userId) {
        return res.status(401).json({ message: "User not logged in" });
    }

    try {
        const [result] = await db.query(
            "DELETE FROM games WHERE id = ? AND user_id = ?",
            [id, userId],
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message:
                    "Game not found or you do not have permission to delete it",
            });
        }

        res.json({ message: "Game deleted successfully" });
    } catch (error) {
        console.error("Error deleting game:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
