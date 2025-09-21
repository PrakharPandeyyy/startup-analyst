import { Storage } from "@google-cloud/storage";
import { env } from "../config/env";

const storage = new Storage();

export async function createSignedUploadUrl(opts: {
  bucket: string;
  objectName: string;
  contentType: string;
  expiresSeconds?: number;
}) {
  const { bucket, objectName, contentType } = opts;
  const expires = Date.now() + (opts.expiresSeconds ?? 10 * 60) * 1000; // default 10 min
  const file = storage.bucket(bucket).file(objectName);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires,
    contentType,
  });
  return { url, gcsUri: `gs://${bucket}/${objectName}` };
}
