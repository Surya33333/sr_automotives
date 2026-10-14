import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);

// Test API
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SR Automotives API is running"
    });
});

// Test MySQL connection
app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "Database connected successfully",
            database: rows
        });

    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚗 SR Automotives API running on http://localhost:${PORT}`);
});