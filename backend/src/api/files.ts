import { Router, Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { colPitchDecks } from "../integrations/firestore";

export const filesRouter = Router();

const storage = new Storage();

// GET /v1/files/pitch-deck/:pitchDeckId/download-url - Get signed download URL
filesRouter.get("/pitch-deck/:pitchDeckId/download-url", async (req: Request, res: Response) => {
  try {
    const { pitchDeckId } = req.params;
    
    // Get pitch deck metadata
    const pitchDeckDoc = await colPitchDecks().doc(pitchDeckId).get();
    if (!pitchDeckDoc.exists) {
      return res.status(404).json({ error: "pitch_deck_not_found" });
    }

    const pitchDeck = pitchDeckDoc.data();
    if (!pitchDeck) {
      return res.status(404).json({ error: "pitch_deck_not_found" });
    }

    // Parse GCS URI
    const gcsUri = pitchDeck.gcsUri;
    if (!gcsUri || !gcsUri.startsWith('gs://')) {
      return res.status(400).json({ error: "invalid_gcs_uri" });
    }

    const [bucketName, ...filePathParts] = gcsUri.replace('gs://', '').split('/');
    const fileName = filePathParts.join('/');

    // Generate signed URL (valid for 1 hour)
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    res.json({
      id: pitchDeckDoc.id,
      startupId: pitchDeck.startupId,
      fileName: pitchDeck.fileName,
      gcsUri: pitchDeck.gcsUri,
      contentType: pitchDeck.contentType,
      sizeBytes: pitchDeck.sizeBytes,
      status: pitchDeck.status,
      downloadUrl: signedUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      createdAt: pitchDeck.createdAt?.toDate(),
      updatedAt: pitchDeck.updatedAt?.toDate()
    });

  } catch (err: any) {
    console.error(`Error generating download URL: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/files/pitch-deck/:pitchDeckId/info - Get file info
filesRouter.get("/pitch-deck/:pitchDeckId/info", async (req: Request, res: Response) => {
  try {
    const { pitchDeckId } = req.params;
    
    const pitchDeckDoc = await colPitchDecks().doc(pitchDeckId).get();
    if (!pitchDeckDoc.exists) {
      return res.status(404).json({ error: "pitch_deck_not_found" });
    }

    const pitchDeck = pitchDeckDoc.data();
    if (!pitchDeck) {
      return res.status(404).json({ error: "pitch_deck_not_found" });
    }

    res.json({
      id: pitchDeckDoc.id,
      startupId: pitchDeck.startupId,
      fileName: pitchDeck.fileName,
      gcsUri: pitchDeck.gcsUri,
      contentType: pitchDeck.contentType,
      sizeBytes: pitchDeck.sizeBytes,
      status: pitchDeck.status,
      createdAt: pitchDeck.createdAt?.toDate(),
      updatedAt: pitchDeck.updatedAt?.toDate()
    });

  } catch (err: any) {
    console.error(`Error getting pitch deck info: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
