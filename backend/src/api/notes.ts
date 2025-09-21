import { Router, Request, Response } from "express";
import { colNotes } from "../integrations/firestore";

export const notesRouter = Router();

// GET /v1/startups/:id/notes
notesRouter.get(
  "/by-startup/:startupId",
  async (req: Request, res: Response) => {
    const q = await colNotes()
      .where("startupId", "==", req.params.startupId)
      .orderBy("version", "desc")
      .limit(20)
      .get();
    const items = q.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ items });
  }
);

// GET /v1/notes/:noteId
notesRouter.get("/:noteId", async (req: Request, res: Response) => {
  const doc = await colNotes().doc(req.params.noteId).get();
  if (!doc.exists) return res.status(404).json({ error: "not_found" });
  res.json({ id: doc.id, ...doc.data() });
});
