import { Router, Request, Response } from "express";
import {
  colSessions,
  colMessages,
  colFinalNotes,
} from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";
import { ChatbotWrapper } from "../agents/chatbot_wrapper";

export const botsRouter = Router();
const chatbotWrapper = new ChatbotWrapper();

// Helper to create a session
async function createSession(
  type: "screener" | "deep_dive" | "questionnaire",
  userId: string,
  opts: { startupId?: string; questionnaireId?: string } = {}
) {
  try {
    const now = Timestamp.now();
    const session = {
      type,
      userId,
      startupId: opts.startupId || null,
      questionnaireId: opts.questionnaireId || null,
      state: {},
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    console.log(`Creating ${type} session for user ${userId}`);
    const doc = await colSessions().add(session as any);
    console.log(`Created session with ID: ${doc.id}`);
    return { sessionId: doc.id };
  } catch (err: any) {
    console.error(`Error creating ${type} session: ${err}`);
    throw err;
  }
}

// Helper to get messages for a session
async function getSessionMessages(sessionId: string, limit = 50) {
  try {
    const q = await colMessages()
      .where("sessionId", "==", sessionId)
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();

    return q.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err: any) {
    console.error(`Error getting session messages: ${err}`);
    throw err;
  }
}

// Screener Bot
botsRouter.post("/screener/session", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid || "anonymous";
    const { goals, filters } = req.body || {};
    const result = await createSession("screener", userId);

    // Save initial state if provided
    if (goals || filters) {
      const state: any = {};
      if (goals) state.goals = goals;
      if (filters) state.filters = filters;

      await colSessions().doc(result.sessionId).update({
        state,
      });
    }

    res.json(result);
  } catch (err: any) {
    console.error(`Error in screener session: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

botsRouter.post(
  "/screener/:sessionId/message",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { text } = req.body || {};

      if (!text) return res.status(400).json({ error: "text_required" });

      // Use the ChatbotWrapper to process the message
      const reply = await chatbotWrapper.processDealScreenerMessage(
        sessionId,
        text
      );

      res.json({ sessionId, reply });
    } catch (err: any) {
      console.error(`Error in screener message: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

botsRouter.get(
  "/screener/:sessionId/messages",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messages = await getSessionMessages(sessionId);
      res.json({ messages });
    } catch (err: any) {
      console.error(`Error getting screener messages: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// Deep Dive Bot
botsRouter.post("/deep-dive/session", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid || "anonymous";
    const { startupId } = req.body || {};

    if (!startupId)
      return res.status(400).json({ error: "startupId_required" });

    // Check if final note exists for this startup
    const finalNoteQuery = await colFinalNotes()
      .where("startupId", "==", startupId)
      .orderBy("version", "desc")
      .limit(1)
      .get();

    if (finalNoteQuery.empty) {
      return res.status(404).json({ error: "final_note_not_found" });
    }

    const result = await createSession("deep_dive", userId, { startupId });

    res.json(result);
  } catch (err: any) {
    console.error(`Error in deep-dive session: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

botsRouter.post(
  "/deep-dive/:sessionId/message",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { text, dealNoteId } = req.body || {};

      if (!text) return res.status(400).json({ error: "text_required" });

      // Use the ChatbotWrapper to process the message
      const reply = await chatbotWrapper.processDeepDiveMessage(
        sessionId,
        text,
        dealNoteId
      );

      res.json({ sessionId, reply });
    } catch (err: any) {
      console.error(`Error in deep-dive message: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

botsRouter.get(
  "/deep-dive/:sessionId/messages",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messages = await getSessionMessages(sessionId);
      res.json({ messages });
    } catch (err: any) {
      console.error(`Error getting deep-dive messages: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// Questionnaire Bot
botsRouter.post(
  "/questionnaire/session",
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.uid || "anonymous";
      const { questionnaireId } = req.body || {};

      if (!questionnaireId)
        return res.status(400).json({ error: "questionnaireId_required" });

      const result = await createSession("questionnaire", userId, {
        questionnaireId,
      });

      res.json(result);
    } catch (err: any) {
      console.error(`Error in questionnaire session: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

botsRouter.post(
  "/questionnaire/:sessionId/message",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { text } = req.body || {};

      if (!text) return res.status(400).json({ error: "text_required" });

      // Get the session to get the questionnaireId
      const sessionDoc = await colSessions().doc(sessionId).get();
      if (!sessionDoc.exists) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const session = sessionDoc.data() as any;
      const questionnaireId = session.questionnaireId;

      if (!questionnaireId) {
        throw new Error(`Session ${sessionId} has no associated questionnaire`);
      }

      // Call the questionnaire agent wrapper
      const reply = await chatbotWrapper.processQuestionnaireMessage(
        sessionId,
        text,
        questionnaireId
      );

      res.json({ sessionId, reply });
    } catch (err: any) {
      console.error(`Error in questionnaire message: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

botsRouter.get(
  "/questionnaire/:sessionId/messages",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messages = await getSessionMessages(sessionId);
      res.json({ messages });
    } catch (err: any) {
      console.error(`Error getting questionnaire messages: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);
