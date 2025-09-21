import { Router, Request, Response } from "express";
import { createSignedUploadUrl } from "../integrations/gcs";
import { env } from "../config/env";
import { colUploads } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";
import { publishEvent } from "../integrations/pubsub";

export const uploadsRouter = Router();

uploadsRouter.post("/pitch:url", async (req: Request, res: Response) => {
  try {
    const { startupId, fileName, contentType, sizeBytes } = req.body || {};
    if (!startupId || !fileName || !contentType || !sizeBytes)
      return res.status(400).json({ error: "invalid_request" });
    if (!env.gcsBucket)
      return res.status(500).json({ error: "gcs_bucket_not_configured" });

    console.log(
      `Creating signed URL for ${startupId}/${fileName} in bucket ${env.gcsBucket}`
    );
    const objectName = `pitch_decks/${startupId}/${Date.now()}_${fileName}`;
    const { url, gcsUri } = await createSignedUploadUrl({
      bucket: env.gcsBucket,
      objectName,
      contentType,
    });

    const now = Timestamp.now();
    const data = {
      startupId,
      type: "pitch_deck",
      gcsUri,
      fileName,
      contentType,
      sizeBytes,
      status: "uploaded",
      createdAt: now,
      updatedAt: now,
    };

    console.log(`Writing upload record to Firestore: ${JSON.stringify(data)}`);
    const doc = await colUploads().add(data as any);
    console.log(`Created upload document with ID: ${doc.id}`);

    res.json({ uploadUrl: url, gcsUri, uploadId: doc.id });
  } catch (err: any) {
    console.error(`Error in pitch:url: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// Fix the path parameter - the issue is with the colon in the path
// Express treats :uploadId as a parameter name, but we're using :confirm as part of the path
uploadsRouter.post(
  "/:uploadId/confirm",
  async (req: Request, res: Response) => {
    try {
      const uploadId = req.params.uploadId;
      console.log(`Confirming upload with ID: ${uploadId}`);

      const docRef = colUploads().doc(uploadId);
      const doc = await docRef.get();

      if (!doc.exists) {
        console.error(`Upload not found with ID: ${uploadId}`);
        return res.status(404).json({ error: "upload_not_found" });
      }

      const data = doc.data() as any;
      console.log(`Found upload record: ${JSON.stringify(data)}`);

      // Publish event for ingestion
      const payload = {
        type: "startup.pitch_uploaded",
        uploadId,
        startupId: data.startupId,
        gcsUri: data.gcsUri,
      };

      console.log(`Publishing Pub/Sub event: ${JSON.stringify(payload)}`);
      const messageId = await publishEvent(env.pubsubTopicIngestion, payload);
      console.log(`Published event with message ID: ${messageId}`);

      res.json({ jobId: messageId, status: "queued" });
    } catch (err: any) {
      console.error(`Error in confirm: ${err}`);
      res
        .status(500)
        .json({
          error: "internal_error",
          message: err?.message || String(err),
        });
    }
  }
);
