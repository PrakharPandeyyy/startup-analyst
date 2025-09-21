import { Router, Request, Response } from "express";
import { colNotes } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const eventsRouter = Router();

// Pub/Sub push endpoint
// Expects { message: { data: base64json } }
eventsRouter.post("/pubsub", async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const message = body.message || {};
    const dataBuffer = message.data
      ? Buffer.from(message.data, "base64")
      : Buffer.from("{}");
    const event = JSON.parse(dataBuffer.toString("utf8"));

    if (event?.type === "startup.pitch_uploaded") {
      const now = Timestamp.now();
      await colNotes().add({
        startupId: event.startupId,
        version: 1,
        schemaVersion: "v1",
        source: "ingestion_auto",
        summary: "Auto-ingested from pitch upload event",
        status: "ready",
        json: {
          title: "Auto Note",
          inputs: { gcsUri: event.gcsUri, uploadId: event.uploadId },
          findings: ["auto stub"],
        },
        createdAt: now,
        updatedAt: now,
      } as any);
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: "bad_request" });
  }
});
