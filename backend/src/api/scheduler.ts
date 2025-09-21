import { Router, Request, Response } from "express";
import { colScheduledCalls } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const schedulerRouter = Router();

// GET /v1/scheduler/available-slots - Get available time slots
schedulerRouter.get("/available-slots", async (req: Request, res: Response) => {
  try {
    // Mock available time slots for hackathon demo
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const availableSlots = [
      new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString(),
      new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
      new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString(),
      new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
      new Date(tomorrow.setHours(15, 0, 0, 0)).toISOString(),
      new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString()
    ];

    res.json({
      availableSlots,
      timezone: "UTC"
    });
  } catch (err: any) {
    console.error(`Error getting available slots: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/scheduler/schedule-call - Schedule a call
schedulerRouter.post("/schedule-call", async (req: Request, res: Response) => {
  try {
    const { startupId, questionnaireId, scheduledTime, phoneNumber } = req.body || {};
    
    if (!startupId || !questionnaireId || !scheduledTime) {
      return res.status(400).json({ error: "startupId_questionnaireId_scheduledTime_required" });
    }

    const now = Timestamp.now();
    const scheduledCallData = {
      startupId,
      questionnaireId,
      scheduledTime,
      phoneNumber: phoneNumber || null,
      status: "scheduled",
      createdAt: now,
      updatedAt: now
    };

    const docRef = await colScheduledCalls().add(scheduledCallData);

    res.json({
      callId: docRef.id,
      status: "scheduled",
      scheduledTime,
      phoneNumber: phoneNumber || null
    });
  } catch (err: any) {
    console.error(`Error scheduling call: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/scheduler/calls/:startupId - Get scheduled calls for startup
schedulerRouter.get("/calls/:startupId", async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    
    const callsQuery = await colScheduledCalls()
      .where("startupId", "==", startupId)
      .orderBy("createdAt", "desc")
      .get();

    const calls = callsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate()
    }));

    res.json({ calls });
  } catch (err: any) {
    console.error(`Error getting scheduled calls: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
