import { Router, Request, Response } from "express";
import {
  colSessions,
  colMessages,
  colFinalNotes,
} from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";
import axios from "axios";
import { env } from "../config/env";

export const botsRouter = Router();

// Helper to create a session
async function createSession(
  type: "screener" | "deep_dive" | "questionnaire",
  userId: string,
  opts: { startupId?: string; questionnaireId?: string } = {}
) {
  try {
    const now = Timestamp.now();
    const sessionData = {
      type,
      userId,
      startupId: opts.startupId,
      questionnaireId: opts.questionnaireId,
      createdAt: now,
      updatedAt: now,
    };

    const sessionRef = await colSessions().add(sessionData);
    return sessionRef.id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

// Helper to save message
async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  try {
    const now = Timestamp.now();
    const messageData = {
      sessionId,
      role,
      content,
      createdAt: now,
    };

    await colMessages().add(messageData);
  } catch (error) {
    console.error("Error saving message:", error);
    // Don't throw - this is not critical
  }
}

// POST /v1/bots/screener/:sessionId/message
botsRouter.post(
  "/screener/:sessionId/message",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { text } = req.body || {};

      if (!text) return res.status(400).json({ error: "text_required" });

      // Save user message
      await saveMessage(sessionId, "user", text);

      // Call the agent server directly
      try {
        const response = await axios.post(`${env.agentBaseUrl}/api/bots/screener`, {
          message: text,
          sessionId: sessionId
        });

        const reply = response.data.reply || "I'm sorry, I couldn't process your request.";
        
        // Save assistant message
        await saveMessage(sessionId, "assistant", reply);

        res.json({ sessionId, reply });
      } catch (agentError: any) {
        console.error(`Agent server error: ${agentError.message}`);
        const fallbackReply = "I'm currently unable to process your request. Please try again later.";
        await saveMessage(sessionId, "assistant", fallbackReply);
        res.json({ sessionId, reply: fallbackReply });
      }
    } catch (err: any) {
      console.error(`Error in screener message: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// POST /v1/bots/deep-dive/:sessionId/message
botsRouter.post(
  "/deep-dive/:sessionId/message",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { text, dealNoteId } = req.body || {};

      if (!text) return res.status(400).json({ error: "text_required" });

      // Save user message
      await saveMessage(sessionId, "user", text);

      // Call the agent server directly
      try {
        const response = await axios.post(`${env.agentBaseUrl}/api/bots/deep-dive`, {
          message: text,
          sessionId: sessionId,
          dealNoteId: dealNoteId
        });

        const reply = response.data.reply || "I'm sorry, I couldn't process your request.";
        
        // Save assistant message
        await saveMessage(sessionId, "assistant", reply);

        res.json({ sessionId, reply });
      } catch (agentError: any) {
        console.error(`Agent server error: ${agentError.message}`);
        const fallbackReply = "I'm currently unable to process your request. Please try again later.";
        await saveMessage(sessionId, "assistant", fallbackReply);
        res.json({ sessionId, reply: fallbackReply });
      }
    } catch (err: any) {
      console.error(`Error in deep-dive message: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// POST /v1/bots/questionnaire/:sessionId/message
botsRouter.post(
  "/questionnaire/:sessionId/message",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { text } = req.body || {};

      if (!text) return res.status(400).json({ error: "text_required" });

      // Save user message
      await saveMessage(sessionId, "user", text);

      // Call the agent server directly
      try {
        const response = await axios.post(`${env.agentBaseUrl}/api/bots/questionnaire`, {
          message: text,
          sessionId: sessionId
        });

        const reply = response.data.reply || "I'm sorry, I couldn't process your request.";
        
        // Save assistant message
        await saveMessage(sessionId, "assistant", reply);

        res.json({ sessionId, reply });
      } catch (agentError: any) {
        console.error(`Agent server error: ${agentError.message}`);
        const fallbackReply = "I'm currently unable to process your request. Please try again later.";
        await saveMessage(sessionId, "assistant", fallbackReply);
        res.json({ sessionId, reply: fallbackReply });
      }
    } catch (err: any) {
      console.error(`Error in questionnaire message: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// POST /v1/bots/questionnaire/generate
botsRouter.post("/questionnaire/generate", async (req: Request, res: Response) => {
  try {
    const { startupId, pitchDeckId, pitchDeckGcsUri } = req.body || {};

    if (!startupId) {
      return res.status(400).json({ error: "startupId_required" });
    }

    // Call the agent server to generate questionnaire
    try {
      const response = await axios.post(`${env.agentBaseUrl}/api/generate-questionnaire`, {
        startupId,
        pitchDeckId,
        pitchDeckGcsUri
      });

      const questions = response.data.questions || [];
      
      res.json({
        questions,
        status: "completed",
        startupId
      });
    } catch (agentError: any) {
      console.error(`Agent server error: ${agentError.message}`);
      res.status(500).json({
        error: "agent_server_error",
        message: "Failed to generate questionnaire"
      });
    }
  } catch (err: any) {
    console.error(`Error generating questionnaire: ${err}`);
    res.status(500).json({
      error: "internal_error",
      message: err?.message || String(err),
    });
  }
});

// GET /v1/bots/sessions/:userId
botsRouter.get("/sessions/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const sessionsQuery = await colSessions()
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const sessions = sessionsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ sessions });
  } catch (err: any) {
    console.error(`Error getting sessions: ${err}`);
    res.status(500).json({
      error: "internal_error",
      message: err?.message || String(err),
    });
  }
});

// GET /v1/bots/messages/:sessionId
botsRouter.get("/messages/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const messagesQuery = await colMessages()
      .where("sessionId", "==", sessionId)
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ messages });
  } catch (err: any) {
    console.error(`Error getting messages: ${err}`);
    res.status(500).json({
      error: "internal_error",
      message: err?.message || String(err),
    });
  }
});
