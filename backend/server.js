// Force Google DNS so Atlas SRV lookups work on any network
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose  = require("mongoose");
const dotenv    = require("dotenv");
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// ── Security Headers (helmet) ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────────
// In production set ALLOWED_ORIGIN=https://yourdeployeddomain.com in .env
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (curl, Postman) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Body parser ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // reject bodies larger than 10 KB

// ── Rate limiters ──────────────────────────────────────────────────────────────
// Strict limiter on auth endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: "Too many login attempts – try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests, slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/",              apiLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/budgets",      require("./routes/budgetRoutes"));
app.use("/api/goals",        require("./routes/goalRoutes"));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler – never leak stack traces in production
app.use((err, _req, res, _next) => {
  const isDev = process.env.NODE_ENV !== "production";
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: isDev ? err.message : "Internal server error",
  });
});

// ── Database & Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB Connected:", mongoose.connection.host);
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀  Server running on http://0.0.0.0:${PORT} [${process.env.NODE_ENV}]`)
    );
  })
  .catch((err) => {
    console.error("❌  MongoDB connection error:", err.message);
    process.exit(1);
  });
