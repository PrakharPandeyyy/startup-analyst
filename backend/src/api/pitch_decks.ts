import { Router, Request, Response } from "express";
import { colPitchDecks } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const pitchDecksRouter = Router();

// POST /v1/pitch-decks - Upload pitch deck
pitchDecksRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { startupId, fileName, gcsUri, contentType, sizeBytes } = req.body || {};
    
    if (!startupId || !fileName || !gcsUri) {
      return res.status(400).json({ error: "startup_id_filename_and_gcs_uri_required" });
    }

    const now = Timestamp.now();
    const doc = await colPitchDecks().add({
      startupId,
      fileName,
      gcsUri,
      contentType: contentType || "application/pdf",
      sizeBytes: sizeBytes || 0,
      status: "uploaded",
      createdAt: now,
      updatedAt: now,
    });

    res.json({ 
      pitchDeckId: doc.id, 
      startupId, 
      fileName, 
      gcsUri,
      status: "uploaded"
    });
  } catch (err: any) {
    console.error(`Error uploading pitch deck: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/pitch-decks/startup/:startupId - Get pitch deck by startup ID
pitchDecksRouter.get("/startup/:startupId", async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const snapshot = await colPitchDecks()
      .where("startupId", "==", startupId)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "pitch_deck_not_found" });
    }

    const pitchDeck = snapshot.docs[0];
    res.json({ 
      id: pitchDeck.id, 
      ...pitchDeck.data() 
    });
  } catch (err: any) {
    console.error(`Error getting pitch deck: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/pitch-decks/:id - Get pitch deck by ID
pitchDecksRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await colPitchDecks().doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "pitch_deck_not_found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    console.error(`Error getting pitch deck: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
