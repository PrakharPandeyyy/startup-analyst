import { Router, Request, Response } from "express";
import {
  colQuestionnaires,
  colFounderAnswers,
} from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const questionnairesRouter = Router();

// POST /v1/questionnaires:generate
questionnairesRouter.post("/generate", async (req: Request, res: Response) => {
  const { startupId, noteId } = req.body || {};
  if (!startupId) return res.status(400).json({ error: "startupId_required" });
  const now = Timestamp.now();
  const doc = await colQuestionnaires().add({
    startupId,
    noteId: noteId || null,
    version: 1,
    schemaVersion: "v1",
    questions: [
      {
        id: "q1",
        text: "Describe your market size.",
        category: "market",
        type: "open",
      },
      {
        id: "q2",
        text: "Key traction metrics for last 6 months?",
        category: "traction",
        type: "open",
      },
    ],
    status: "ready",
    createdAt: now,
    updatedAt: now,
  } as any);
  res.json({ questionnaireId: doc.id, status: "ready" });
});

// GET /v1/questionnaires/by-startup/:startupId
questionnairesRouter.get(
  "/by-startup/:startupId",
  async (req: Request, res: Response) => {
    const q = await colQuestionnaires()
      .where("startupId", "==", req.params.startupId)
      .orderBy("version", "desc")
      .get();
    const items = q.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ items });
  }
);

// GET /v1/questionnaires/:id
questionnairesRouter.get("/:id", async (req: Request, res: Response) => {
  const doc = await colQuestionnaires().doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "not_found" });
  res.json({ id: doc.id, ...doc.data() });
});

// POST /v1/questionnaires/:id/answers
questionnairesRouter.post(
  "/:id/answers",
  async (req: Request, res: Response) => {
    const questionnaireId = req.params.id;
    const { startupId, answers, transcriptUri } = req.body || {};
    if (!startupId || !Array.isArray(answers))
      return res.status(400).json({ error: "invalid_request" });
    const now = Timestamp.now();
    const doc = await colFounderAnswers().add({
      startupId,
      questionnaireId,
      answers,
      transcriptUri: transcriptUri || null,
      status: "complete",
      createdAt: now,
      updatedAt: now,
    } as any);
    res.json({ answerId: doc.id, status: "complete" });
  }
);
