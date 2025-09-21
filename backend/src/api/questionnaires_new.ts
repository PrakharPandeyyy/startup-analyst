import { Router, Request, Response } from "express";
import { colQuestionnaires } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const questionnairesNewRouter = Router();

// POST /v1/questionnaires - Generate questionnaire from pitch deck
questionnairesNewRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { startupId, pitchDeckId, questions } = req.body || {};
    
    if (!startupId || !pitchDeckId || !questions) {
      return res.status(400).json({ error: "startup_id_pitch_deck_id_and_questions_required" });
    }

    const now = Timestamp.now();
    const doc = await colQuestionnaires().add({
      startupId,
      pitchDeckId,
      questions,
      status: "generated",
      createdAt: now,
      updatedAt: now,
    });

    res.json({ 
      questionnaireId: doc.id, 
      startupId, 
      pitchDeckId,
      questions,
      status: "generated"
    });
  } catch (err: any) {
    console.error(`Error generating questionnaire: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/questionnaires/startup/:startupId - Get questionnaire by startup ID
questionnairesNewRouter.get("/startup/:startupId", async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const snapshot = await colQuestionnaires()
      .where("startupId", "==", startupId)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "questionnaire_not_found" });
    }

    const questionnaire = snapshot.docs[0];
    res.json({ 
      id: questionnaire.id, 
      ...questionnaire.data() 
    });
  } catch (err: any) {
    console.error(`Error getting questionnaire: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/questionnaires/:id - Get questionnaire by ID
questionnairesNewRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await colQuestionnaires().doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "questionnaire_not_found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    console.error(`Error getting questionnaire: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
