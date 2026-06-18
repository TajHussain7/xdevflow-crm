import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

// ── App bootstrap ─────────────────────────────────
const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
app.set("trust proxy", 1);
// ── Security & utility middleware ─────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// ── Rate limiting ─────────────────────────────────
// General API limiter: 100 req / 15 min
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Auth limiter: 10 req / 15 min  (brute-force protection)
app.use("/api/v1/auth/", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

// ── Routes ────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/activity", activityRoutes);

// ── Health check ──────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Global error handler (must be last) ───────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  XDevFlow API running → http://localhost:${PORT}`);
});

export default app;
