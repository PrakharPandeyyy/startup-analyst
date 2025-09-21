import { Router, Request, Response } from "express";
import { colFinalNotes } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const finalNotesRouter = Router();

// POST /v1/final-notes:generate
finalNotesRouter.post("/generate", async (req: Request, res: Response) => {
  const { startupId, noteId, questionnaireId, founderAnswersId } =
    req.body || {};
  if (!startupId) return res.status(400).json({ error: "startupId_required" });
  const now = Timestamp.now();
  const doc = await colFinalNotes().add({
    startupId,
    noteId: noteId || null,
    questionnaireId: questionnaireId || null,
    founderAnswersId: founderAnswersId || null,
    version: 2,
    schemaVersion: "v2",
    scorecard: {
      team: 8,
      market: 7.5,
      product: 8,
      traction: 7,
      risk: 0.3,
      overall: 7.6,
    },
    risks: [{ type: "metric_inconsistency", severity: "medium", note: "stub" }],
    benchmarks: { source: "stub" },
    recommendation: "Proceed",
    json: { title: "Stub Final Note" },
    status: "ready",
    createdAt: now,
    updatedAt: now,
  } as any);
  res.json({ finalNoteId: doc.id, status: "ready" });
});

// GET /v1/final-notes/by-startup/:startupId (latest)
finalNotesRouter.get(
  "/by-startup/:startupId",
  async (req: Request, res: Response) => {
    const q = await colFinalNotes()
      .where("startupId", "==", req.params.startupId)
      .orderBy("version", "desc")
      .limit(1)
      .get();
    if (q.empty) return res.status(404).json({ error: "not_found" });
    const d = q.docs[0];
    res.json({ id: d.id, ...d.data() });
  }
);

// GET /v1/final-notes/:id
finalNotesRouter.get("/:id", async (req: Request, res: Response) => {
  const doc = await colFinalNotes().doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "not_found" });
  res.json({ id: doc.id, ...doc.data() });
});
