import { Router, Request, Response } from "express";
import { colNotes } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";
import { StartupAnalystWrapper } from "../agents/startup_analyst_wrapper";
import { QuestionnaireAgentWrapper } from "../agents/questionnaire_agent_wrapper";
import { ChatbotWrapper } from "../agents/chatbot_wrapper";

export const agentsRouter = Router();
const startupAnalyst = new StartupAnalystWrapper();
const questionnaireAgent = new QuestionnaireAgentWrapper();
const chatbotWrapper = new ChatbotWrapper();

// POST /v1/agents/ingestion:run
agentsRouter.post("/ingestion:run", async (req: Request, res: Response) => {
  try {
    const { startupId, gcsUri } = req.body || {};
    if (!startupId)
      return res.status(400).json({ error: "startupId_required" });

    // Use the StartupAnalystWrapper to run ingestion
    const noteId = await startupAnalyst.runIngestion(startupId, gcsUri || "");

    res.json({ noteId, status: "ready" });
  } catch (err: any) {
    console.error(`Error in ingestion:run: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/agents/deep-research:run
agentsRouter.post("/deep-research:run", async (req: Request, res: Response) => {
  try {
    const { noteId } = req.body || {};
    if (!noteId) return res.status(400).json({ error: "noteId_required" });

    // Use the StartupAnalystWrapper to run deep research
    await startupAnalyst.runDeepResearch(noteId);

    res.json({ status: "ready" });
  } catch (err: any) {
    console.error(`Error in deep-research:run: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/agents/deal-scoring:run
agentsRouter.post("/deal-scoring:run", async (req: Request, res: Response) => {
  try {
    const { noteId } = req.body || {};
    if (!noteId) return res.status(400).json({ error: "noteId_required" });

    // Use the StartupAnalystWrapper to run deal scoring
    await startupAnalyst.runDealScoring(noteId);

    res.json({ status: "ready" });
  } catch (err: any) {
    console.error(`Error in deal-scoring:run: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/agents/full-analysis:run
agentsRouter.post("/full-analysis:run", async (req: Request, res: Response) => {
  try {
    const { startupId, gcsUri } = req.body || {};
    if (!startupId)
      return res.status(400).json({ error: "startupId_required" });
    if (!gcsUri) return res.status(400).json({ error: "gcsUri_required" });

    // Use the StartupAnalystWrapper to run full analysis
    const noteId = await startupAnalyst.runFullAnalysis(startupId, gcsUri);

    res.json({ noteId, status: "ready" });
  } catch (err: any) {
    console.error(`Error in full-analysis:run: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/agents/questionnaire:run
agentsRouter.post("/questionnaire:run", async (req: Request, res: Response) => {
  try {
    const { startupId, noteId } = req.body || {};
    if (!startupId)
      return res.status(400).json({ error: "startupId_required" });
    if (!noteId) return res.status(400).json({ error: "noteId_required" });

    // Use the QuestionnaireAgentWrapper to generate questionnaire
    const questionnaireId = await questionnaireAgent.generateQuestionnaire(
      startupId,
      noteId
    );

    res.json({ questionnaireId, status: "ready" });
  } catch (err: any) {
    console.error(`Error in questionnaire:run: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/agents/questionnaire-assist:run
agentsRouter.post(
  "/questionnaire-assist:run",
  async (req: Request, res: Response) => {
    try {
      const { questionnaireId, question } = req.body || {};
      if (!questionnaireId)
        return res.status(400).json({ error: "questionnaireId_required" });
      if (!question)
        return res.status(400).json({ error: "question_required" });

      // Use the QuestionnaireAgentWrapper to get assistance
      const response = await questionnaireAgent.getQuestionnaireAssistance(
        questionnaireId,
        question
      );

      res.json({ response });
    } catch (err: any) {
      console.error(`Error in questionnaire-assist:run: ${err}`);
      res
        .status(500)
        .json({
          error: "internal_error",
          message: err?.message || String(err),
        });
    }
  }
);

// POST /v1/agents/deal-screener:run
agentsRouter.post("/deal-screener:run", async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body || {};
    if (!sessionId)
      return res.status(400).json({ error: "sessionId_required" });
    if (!message) return res.status(400).json({ error: "message_required" });

    // Use the ChatbotWrapper to process deal screener message
    const reply = await chatbotWrapper.processDealScreenerMessage(
      sessionId,
      message
    );

    res.json({ reply });
  } catch (err: any) {
    console.error(`Error in deal-screener:run: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/agents/deep-dive:run
agentsRouter.post("/deep-dive:run", async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body || {};
    if (!sessionId)
      return res.status(400).json({ error: "sessionId_required" });
    if (!message) return res.status(400).json({ error: "message_required" });

    // Use the ChatbotWrapper to process deep dive message
    const reply = await chatbotWrapper.processDeepDiveMessage(
      sessionId,
      message
    );

    res.json({ reply });
  } catch (err: any) {
    console.error(`Error in deep-dive:run: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});
