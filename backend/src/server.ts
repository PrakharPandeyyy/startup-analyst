import express from "express";
import cors from "cors";
// import { agentsRouter } from "./api/agents";
import { botsRouter } from "./api/bots";
import { usersRouter } from "./api/users";
import { companiesRouter } from "./api/companies";
import { ragRouter } from "./api/rag";
import { startupsRouter } from "./api/startups_new";
import { schedulerRouter } from "./api/scheduler";
import { authRouter } from "./api/auth";
import { filesRouter } from "./api/files";
import { startupAnalystRouter } from "./api/startup_analyst";
import { dealNotesNewRouter } from "./api/deal_notes_new";

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
// app.use("/v1/agents", agentsRouter);
app.use("/v1/bots", botsRouter);
app.use("/v1/users", usersRouter);
app.use("/v1/companies", companiesRouter);
app.use("/v1/rag", ragRouter);
app.use("/v1/startups", startupsRouter);
app.use("/v1/scheduler", schedulerRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/files", filesRouter);
app.use("/v1/startup-analyst", startupAnalystRouter);
app.use("/v1/deal-notes", dealNotesNewRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "not_found" });
});

export default app;
