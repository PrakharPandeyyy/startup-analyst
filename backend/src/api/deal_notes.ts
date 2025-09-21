import { Router, Request, Response } from "express";
import { colDealNotes, colUsers } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const dealNotesRouter = Router();

// POST /v1/deal-notes - Create deal note
dealNotesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { startupId, json } = req.body || {};
    if (!startupId || !json) {
      return res.status(400).json({ error: "startupId_and_json_required" });
    }

    const now = Timestamp.now();
    const doc = await colDealNotes().add({
      startupId,
      version: 1,
      schemaVersion: "v1",
      json,
      status: "ready",
      createdAt: now,
      updatedAt: now,
    });

    // Update user profile with deal note data
    try {
      const updateData: any = {
        updatedAt: now,
      };

      if (json.description) updateData.description = json.description;
      if (json.score?.total) updateData.score = json.score.total;
      if (json.sector) updateData.category = json.sector;

      await colUsers().doc(startupId).update(updateData);
    } catch (updateErr) {
      console.warn(`Failed to update user profile: ${updateErr}`);
      // Don't fail the deal note creation if profile update fails
    }

    res.json({ 
      dealNoteId: doc.id, 
      startupId,
      status: "ready" 
    });
  } catch (err: any) {
    console.error(`Error creating deal note: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes/:id - Get deal note by ID
dealNotesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await colDealNotes().doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "deal_note_not_found" });
    }

    const dealNote = { id: doc.id, ...doc.data() };
    res.json(dealNote);
  } catch (err: any) {
    console.error(`Error getting deal note: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes/by-startup/:startupId - Get deal notes by startup
dealNotesRouter.get("/by-startup/:startupId", async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const snapshot = await colDealNotes()
      .where("startupId", "==", startupId)
      .orderBy("createdAt", "desc")
      .get();

    const dealNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ dealNotes, total: dealNotes.length });
  } catch (err: any) {
    console.error(`Error getting deal notes by startup: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes - Get all deal notes (for RAG)
dealNotesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const snapshot = await colDealNotes()
      .orderBy("createdAt", "desc")
      .get();

    const dealNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ dealNotes, total: dealNotes.length });
  } catch (err: any) {
    console.error(`Error getting all deal notes: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes/rag/search - Search deal notes for RAG
dealNotesRouter.get("/rag/search", async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: "query_required" });
    }

    // For now, return all deal notes (in production, implement proper search)
    const snapshot = await colDealNotes()
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit as string))
      .get();

    const dealNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ 
      dealNotes, 
      total: dealNotes.length,
      query: query as string
    });
  } catch (err: any) {
    console.error(`Error searching deal notes: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
