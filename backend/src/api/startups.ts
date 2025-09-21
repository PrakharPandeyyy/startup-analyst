import { Router, Request, Response } from "express";
import {
  colStartups,
  type Startup,
  colNotes,
  colFinalNotes,
} from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const startupsRouter = Router();

startupsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const payload = req.body as Partial<Startup>;
    if (!payload.name || !payload.category)
      return res.status(400).json({ error: "name_and_category_required" });
    const now = Timestamp.now();
    const doc = await colStartups().add({
      name: payload.name,
      slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, "-"),
      category: payload.category,
      stage: payload.stage || null,
      geography: payload.geography || null,
      website: payload.website || null,
      founders: payload.founders || [],
      tags: payload.tags || [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    } as any);
    res.json({ startupId: doc.id });
  } catch (err: any) {
    console.error(`Error creating startup: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

startupsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const doc = await colStartups().doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "not_found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    console.error(`Error getting startup ${req.params.id}: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

startupsRouter.get("/:id/summary", async (req: Request, res: Response) => {
  try {
    const doc = await colStartups().doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "not_found" });
    const d = doc.data() as Startup;
    res.json({
      id: doc.id,
      name: d.name,
      category: d.category,
      stage: d.stage,
      geography: d.geography,
    });
  } catch (err: any) {
    console.error(`Error getting startup summary ${req.params.id}: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

startupsRouter.get("/:id/status", async (req: Request, res: Response) => {
  try {
    res.json({ status: "pending" });
  } catch (err: any) {
    console.error(`Error getting startup status ${req.params.id}: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/startups/:id/notes
startupsRouter.get("/:id/notes", async (req: Request, res: Response) => {
  try {
    console.log(`Getting notes for startup ${req.params.id}`);
    const q = await colNotes()
      .where("startupId", "==", req.params.id)
      .orderBy("version", "desc")
      .get();
    const items = q.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`Found ${items.length} notes for startup ${req.params.id}`);
    res.json({ items });
  } catch (err: any) {
    console.error(`Error getting startup notes ${req.params.id}: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/startups/:id/final-note (latest)
startupsRouter.get("/:id/final-note", async (req: Request, res: Response) => {
  try {
    const q = await colFinalNotes()
      .where("startupId", "==", req.params.id)
      .orderBy("version", "desc")
      .limit(1)
      .get();
    if (q.empty) return res.status(404).json({ error: "not_found" });
    const d = q.docs[0];
    res.json({ id: d.id, ...d.data() });
  } catch (err: any) {
    console.error(`Error getting startup final note ${req.params.id}: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});
