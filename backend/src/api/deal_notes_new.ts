import { Router, Request, Response } from "express";
import { colDealNotes } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const dealNotesNewRouter = Router();

// POST /v1/deal-notes - Create deal note from pitch deck + Q&A
dealNotesNewRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { startupId, pitchDeckId, questionnaireId, qaResponseId, dealNote } = req.body || {};
    
    if (!startupId || !dealNote) {
      return res.status(400).json({ error: "startup_id_and_deal_note_required" });
    }

    const now = Timestamp.now();
    const doc = await colDealNotes().add({
      startupId,
      pitchDeckId: pitchDeckId || null,
      questionnaireId: questionnaireId || null,
      qaResponseId: qaResponseId || null,
      dealNote, // The full deal note object from the attached file
      status: "completed",
      createdAt: now,
      updatedAt: now,
    });

    res.json({ 
      dealNoteId: doc.id, 
      startupId, 
      dealNote,
      status: "completed"
    });
  } catch (err: any) {
    console.error(`Error creating deal note: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes/startup/:startupId - Get deal note by startup ID
dealNotesNewRouter.get("/startup/:startupId", async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const snapshot = await colDealNotes()
      .where("startupId", "==", startupId)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "deal_note_not_found" });
    }

    const dealNote = snapshot.docs[0];
    res.json({ 
      id: dealNote.id, 
      ...dealNote.data() 
    });
  } catch (err: any) {
    console.error(`Error getting deal note: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes/:id - Get deal note by ID
dealNotesNewRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await colDealNotes().doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "deal_note_not_found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    console.error(`Error getting deal note: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes - Get all deal notes (for RAG/deal screener)
dealNotesNewRouter.get("/", async (req: Request, res: Response) => {
  try {
    const snapshot = await colDealNotes()
      .orderBy("createdAt", "desc")
      .get();

    const dealNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ 
      dealNotes,
      total: dealNotes.length
    });
  } catch (err: any) {
    console.error(`Error getting all deal notes: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
