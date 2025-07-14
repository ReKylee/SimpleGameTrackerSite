const mysql2 = require("mysql2/promise");
require("dotenv").config();

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

(async function initializeDatabase() {
    try {
        console.log("Checking if database exists...");

        const connection = await pool.getConnection();

        await connection.query(
            `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
        );
        console.log(`Database ${process.env.DB_NAME} is ready.`);

        await connection.query(`USE ${process.env.DB_NAME}`);

        await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT UNIQUE AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

        await connection.query(`
        CREATE TABLE IF NOT EXISTS games (
            user_id INT NOT NULL,
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            platform VARCHAR(100),
            status ENUM('Playing', 'Completed', 'Backlog'),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

        console.log("Tables initialized successfully.");
        connection.release();
    } catch (error) {
        console.error("Database initialization error:", error);
        process.exit(1);
    }
})();

module.exports = pool;
