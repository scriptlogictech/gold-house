const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const authRoutes = require("../routes/authRoutes");
const customerRoutes = require("../routes/customerRoutes");
const familyRoutes = require("../routes/familyRoutes");
const invoiceRoutes = require("../routes/invoiceRoutes");
const productRoutes = require("../routes/productRoutes");

const app = express();

app.disable("x-powered-by");

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gold House DSS API is running",
  });
});

app.get("/api/v1/health", (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;
  res.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    message: isDatabaseConnected
      ? "Gold House DSS API is healthy"
      : "Database connection is unavailable",
    database: isDatabaseConnected ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/families", familyRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/products", productRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.message === "Origin is not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "This origin is not allowed.",
    });
  }

  console.error(err);
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected server error occurred."
        : err.message || "Internal server error",
  });
});

module.exports = app;
