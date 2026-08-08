import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/database.js";
import { authRouter } from "./routes/auth.js";
import { goalsRouter } from "./routes/goals.js";
import { groupsRouter } from "./routes/groups.js";
import { splitsRouter } from "./routes/splits.js";
import { transactionsRouter } from "./routes/transactions.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to a random value with at least 32 characters.");
}

const app = express();
const configuredOrigins = process.env.CLIENT_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopment = Boolean(origin && /^http:\/\/localhost:\d+$/.test(origin));
    if (!origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin) || isLocalDevelopment) {
      return callback(null, true);
    }
    return callback(new Error("This website is not allowed to call the API."));
  },
}));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/splits", splitsRouter);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
});

const port = Number(process.env.PORT ?? 5000);
connectDatabase()
  .then(() => app.listen(port, () => console.log(`Fintrail API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error("Could not start API:", error.message);
    process.exit(1);
  });
