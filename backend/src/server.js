
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import razorpayWebhookRoutes from "./routes/paymentWebhookRoutes.js";

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ||
  "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Razorpay webhook must receive the raw request body.
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhookRoutes
)

app.use(express.json());
app.use(cookieParser());

// Require trusted Origin on browser-style state-changing requests.
// This is one layer of CSRF protection for cookie authentication.
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
  }

  next();
});

app.use("/api", authRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SR Automotives API is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.json({
      success: true,
      message: "Database connected successfully",
      database: rows,
    });
  } catch (error) {
    console.error("Database Error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `SR Automotives API running on http://localhost:${PORT}`
  );
});
