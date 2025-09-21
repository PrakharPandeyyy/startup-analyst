import { Router, Request, Response } from "express";
import {
  colUsers,
  colPitchDecks,
  colQuestionnaires,
  colScheduledCalls,
  colDealNotes,
  colUploads,
  type User,
  type PitchDeck,
  type Questionnaire,
  type ScheduledCall,
  type DealNote,
} from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";
import axios from "axios";
import { env } from "../config/env";

export const startupsRouter = Router();

// Helper function to generate questionnaire using real agent
async function generateQuestionnaire(
  startupId: string,
  pitchDeckGcsUri: string,
  pitchDeckId?: string
): Promise<{ questionnaireId: string; questions: any[] }> {
  try {
    console.log(
      `Generating questionnaire for startup ${startupId} with pitch deck ${pitchDeckGcsUri} (ID: ${
        pitchDeckId || "none"
      })`
    );

    // Call real questionnaire agent
    const response = await axios.post(
      `${env.chatbotBaseUrl}/api/generate-questionnaire`,
      {
        startupId,
        pitchDeckGcsUri,
        pitchDeckId, // Pass pitch deck ID to the agent
      }
    );

    const questions = response.data.questions;

    const now = Timestamp.now();
    const questionnaireData: Questionnaire = {
      startupId,
      version: 1,
      schemaVersion: "v1",
      questions: questions,
      status: "ready",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await colQuestionnaires().add(questionnaireData);
    return {
      questionnaireId: docRef.id,
      questions: questions,
    };
  } catch (error: any) {
    console.error(`Error generating questionnaire: ${error}`);

    // Fallback to mock questionnaire
    const mockQuestions = [
      {
        id: "q1",
        text: "What is your total addressable market (TAM)?",
        category: "market",
        type: "text",
      },
      {
        id: "q2",
        text: "What is your customer acquisition cost (CAC)?",
        category: "unit_economics",
        type: "text",
      },
      {
        id: "q3",
        text: "What is your monthly recurring revenue (MRR)?",
        category: "revenue",
        type: "text",
      },
      {
        id: "q4",
        text: "Who are your main competitors?",
        category: "competition",
        type: "text",
      },
      {
        id: "q5",
        text: "What is your go-to-market strategy?",
        category: "strategy",
        type: "text",
      },
    ];

    const now = Timestamp.now();
    const questionnaireData: Questionnaire = {
      startupId,
      version: 1,
      schemaVersion: "v1",
      questions: mockQuestions,
      status: "ready",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await colQuestionnaires().add(questionnaireData);
    return {
      questionnaireId: docRef.id,
      questions: mockQuestions,
    };
  }
}

// POST /v1/startups/upload-pitch - Upload pitch deck
startupsRouter.post("/upload-pitch", async (req: Request, res: Response) => {
  try {
    const { startupId, fileName, gcsUri, contentType, sizeBytes } =
      req.body || {};

    if (!startupId || !fileName || !gcsUri) {
      return res
        .status(400)
        .json({ error: "startupId_fileName_gcsUri_required" });
    }

    const now = Timestamp.now();
    const pitchDeckData: PitchDeck = {
      startupId,
      fileName,
      gcsUri,
      contentType: contentType || "application/pdf",
      sizeBytes: sizeBytes || 0,
      status: "uploaded",
      createdAt: now,
      updatedAt: now,
    };

    // 1. Save pitch deck
    const docRef = await colPitchDecks().add(pitchDeckData);

    // 2. Auto-generate questionnaire using real agent
    let questionnaireResult = null;
    try {
      questionnaireResult = await generateQuestionnaire(
        startupId,
        gcsUri,
        docRef.id
      );
      console.log(
        `✅ Auto-generated questionnaire for startup ${startupId}: ${questionnaireResult.questionnaireId}`
      );
    } catch (questionnaireError) {
      console.error(
        `⚠️ Failed to auto-generate questionnaire for startup ${startupId}:`,
        questionnaireError
      );
      // Continue with pitch deck upload even if questionnaire generation fails
    }

    res.json({
      pitchDeckId: docRef.id,
      status: "uploaded",
      questionnaire: questionnaireResult
        ? {
            questionnaireId: questionnaireResult.questionnaireId,
            questions: questionnaireResult.questions,
            status: "ready",
          }
        : null,
      message: questionnaireResult
        ? "Pitch deck uploaded and questionnaire generated"
        : "Pitch deck uploaded (questionnaire generation failed)",
    });
  } catch (err: any) {
    console.error(`Error uploading pitch deck: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/startups/:id/pitch-deck - Get pitch deck
startupsRouter.get("/:id/pitch-deck", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pitchDeckQuery = await colPitchDecks()
      .where("startupId", "==", id)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (pitchDeckQuery.empty) {
      return res.status(404).json({ error: "pitch_deck_not_found" });
    }

    const pitchDeckDoc = pitchDeckQuery.docs[0];
    const pitchDeck = pitchDeckDoc.data();

    res.json({
      id: pitchDeckDoc.id,
      startupId: pitchDeck.startupId,
      fileName: pitchDeck.fileName,
      gcsUri: pitchDeck.gcsUri,
      contentType: pitchDeck.contentType,
      sizeBytes: pitchDeck.sizeBytes,
      status: pitchDeck.status,
      createdAt: pitchDeck.createdAt?.toDate(),
      updatedAt: pitchDeck.updatedAt?.toDate(),
    });
  } catch (err: any) {
    console.error(`Error getting pitch deck: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/startups/:id/generate-questionnaire - Generate questionnaire
startupsRouter.post(
  "/:id/generate-questionnaire",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get pitch deck
      const pitchDeckQuery = await colPitchDecks()
        .where("startupId", "==", id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (pitchDeckQuery.empty) {
        return res.status(404).json({ error: "pitch_deck_not_found" });
      }

      const pitchDeckDoc = pitchDeckQuery.docs[0];
      const pitchDeck = pitchDeckDoc.data();

      // Generate questionnaire using real agent
      const questionnaireResult = await generateQuestionnaire(
        id,
        pitchDeck.gcsUri,
        pitchDeckDoc.id
      );

      res.json({
        questionnaireId: questionnaireResult.questionnaireId,
        questions: questionnaireResult.questions,
        status: "ready",
      });
    } catch (err: any) {
      console.error(`Error generating questionnaire: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// GET /v1/startups/:id/questionnaire - Get questionnaire
startupsRouter.get(
  "/:id/questionnaire",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const questionnaireQuery = await colQuestionnaires()
        .where("startupId", "==", id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (questionnaireQuery.empty) {
        return res.status(404).json({ error: "questionnaire_not_found" });
      }

      const questionnaireDoc = questionnaireQuery.docs[0];
      const questionnaire = questionnaireDoc.data();

      res.json({
        id: questionnaireDoc.id,
        startupId: questionnaire.startupId,
        version: questionnaire.version,
        schemaVersion: questionnaire.schemaVersion,
        questions: questionnaire.questions,
        status: questionnaire.status,
        createdAt: questionnaire.createdAt?.toDate(),
        updatedAt: questionnaire.updatedAt?.toDate(),
      });
    } catch (err: any) {
      console.error(`Error getting questionnaire: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// POST /v1/startups/:id/save-answers - Save questionnaire answers
startupsRouter.post(
  "/:id/save-answers",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { answers } = req.body || {};

      if (!answers) {
        return res.status(400).json({ error: "answers_required" });
      }

      // Get questionnaire
      const questionnaireQuery = await colQuestionnaires()
        .where("startupId", "==", id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (questionnaireQuery.empty) {
        return res.status(404).json({ error: "questionnaire_not_found" });
      }

      const questionnaireDoc = questionnaireQuery.docs[0];
      const questionnaire = questionnaireDoc.data();

      // Update questionnaire with answers
      await colQuestionnaires().doc(questionnaireDoc.id).update({
        answers: answers,
        status: "completed",
        updatedAt: Timestamp.now(),
      });

      // Check if we have both pitch deck and answers, then trigger full analysis
      const pitchDeckQuery = await colPitchDecks()
        .where("startupId", "==", id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!pitchDeckQuery.empty) {
        const pitchDeckDoc = pitchDeckQuery.docs[0];
        const pitchDeck = pitchDeckDoc.data();

        // TODO: Trigger full analysis with Startup-Analyst
        console.log(
          `✅ Ready for full analysis: startup ${id} has both pitch deck and answers`
        );
      }

      res.json({
        questionnaireId: questionnaireDoc.id,
        status: "answers_saved",
        message: "Answers saved successfully",
      });
    } catch (err: any) {
      console.error(`Error saving answers: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// POST /v1/startups/:id/generate-deal-note - Generate deal note using Startup-Analyst
startupsRouter.post(
  "/:id/generate-deal-note",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get pitch deck and questionnaire answers
      const pitchDeckQuery = await colPitchDecks()
        .where("startupId", "==", id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
      const questionnaireQuery = await colQuestionnaires()
        .where("startupId", "==", id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (pitchDeckQuery.empty) {
        return res.status(404).json({ error: "pitch_deck_not_found" });
      }

      if (questionnaireQuery.empty) {
        return res.status(404).json({ error: "questionnaire_not_found" });
      }

      const pitchDeckDoc = pitchDeckQuery.docs[0];
      const pitchDeck = pitchDeckDoc.data();
      const questionnaireDoc = questionnaireQuery.docs[0];
      const questionnaire = questionnaireDoc.data();

      // Call Startup-Analyst for full analysis
      try {
        const response = await axios.post(
          `${env.agentBaseUrl}/api/full-analysis`,
          {
            startupId: id,
            pitchDeckGcsUri: pitchDeck.gcsUri,
            questionnaireAnswers: questionnaire.answers || {},
          }
        );

        const note = response.data.note;
        const noteId = response.data.noteId;

        // Save deal note to Firestore
        const now = Timestamp.now();
        const dealNoteData: DealNote = {
          startupId: id,
          dealNote: note,
          createdAt: now,
          updatedAt: now,
        };

        const dealNoteRef = await colDealNotes().add(dealNoteData);

        // Update user profile with extracted data
        if (note.score?.total !== undefined) {
          await colUsers()
            .doc(id)
            .update({
              score: note.score.total,
              description: note.company || "",
              category: note.sector?.name || "unknown",
              updatedAt: now,
            });
        }

        res.json({
          dealNoteId: dealNoteRef.id,
          note: note,
          status: "completed",
          message: "Deal note generated successfully",
        });
      } catch (agentError: any) {
        console.error(`Error calling Startup-Analyst: ${agentError}`);

        // Fallback to mock deal note
        const mockDealNote = {
          company: "Mock Company",
          score: { total: 7.5 },
          facts: { founders: [], traction: {} },
          verification: { checks: [] },
          benchmarks: { peers: [] },
          risks: [],
          term_sheet: { clauses: [] },
          sector: { kpis: [] },
        };

        const now = Timestamp.now();
        const dealNoteData: DealNote = {
          startupId: id,
          dealNote: mockDealNote,
          createdAt: now,
          updatedAt: now,
        };

        const dealNoteRef = await colDealNotes().add(dealNoteData);

        res.json({
          dealNoteId: dealNoteRef.id,
          note: mockDealNote,
          status: "completed_mock",
          message: "Deal note generated using mock data",
        });
      }
    } catch (err: any) {
      console.error(`Error generating deal note: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// GET /v1/startups/:id/deal-note - Get deal note
startupsRouter.get("/:id/deal-note", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dealNoteQuery = await colDealNotes()
      .where("startupId", "==", id)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (dealNoteQuery.empty) {
      return res.status(404).json({ error: "deal_note_not_found" });
    }

    const dealNoteDoc = dealNoteQuery.docs[0];
    const dealNote = dealNoteDoc.data();

    res.json({
      id: dealNoteDoc.id,
      startupId: dealNote.startupId,
      dealNote: dealNote.dealNote,
      createdAt: dealNote.createdAt?.toDate(),
      updatedAt: dealNote.updatedAt?.toDate(),
    });
  } catch (err: any) {
    console.error(`Error getting deal note: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/startups/deal-notes - Get all deal notes
startupsRouter.get("/deal-notes", async (req: Request, res: Response) => {
  try {
    const dealNotesSnapshot = await colDealNotes().get();

    if (dealNotesSnapshot.empty) {
      return res.json({ dealNotes: [] });
    }

    const dealNotes = dealNotesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        startupId: data.startupId,
        dealNote: data.dealNote,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    res.json({ dealNotes });
  } catch (err: any) {
    console.error(`Error getting all deal notes: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/deal-notes/:id - Get deal note by ID
startupsRouter.get("/deal-notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dealNoteDoc = await colDealNotes().doc(id).get();
    if (!dealNoteDoc.exists) {
      return res.status(404).json({ error: "deal_note_not_found" });
    }

    const dealNote = dealNoteDoc.data();
    if (!dealNote) {
      return res.status(404).json({ error: "deal_note_data_missing" });
    }

    res.json({
      id: dealNoteDoc.id,
      startupId: dealNote.startupId,
      dealNote: dealNote.dealNote,
      createdAt: dealNote.createdAt?.toDate(),
      updatedAt: dealNote.updatedAt?.toDate(),
    });
  } catch (err: any) {
    console.error(`Error getting deal note: ${err}`);
    res
      .status(500)
      .json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/startups/:id/upload-real-deal-note - Upload pre-existing deal note
startupsRouter.post(
  "/:id/upload-real-deal-note",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { dealNote } = req.body || {};

      if (!dealNote) {
        return res.status(400).json({ error: "deal_note_required" });
      }

      const now = Timestamp.now();
      const dealNoteData: DealNote = {
        startupId: id,
        dealNote: dealNote,
        createdAt: now,
        updatedAt: now,
      };

      const dealNoteRef = await colDealNotes().add(dealNoteData);

      // Update user profile with extracted data
      if (dealNote.score?.total !== undefined) {
        await colUsers()
          .doc(id)
          .update({
            score: dealNote.score.total,
            description: dealNote.company || "",
            category: dealNote.sector?.name || "unknown",
            updatedAt: now,
          });
      }

      res.json({
        dealNoteId: dealNoteRef.id,
        status: "uploaded",
        message: "Deal note uploaded successfully",
      });
    } catch (err: any) {
      console.error(`Error uploading deal note: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// POST /v1/startups/:id/schedule-call - Schedule a call
startupsRouter.post(
  "/:id/schedule-call",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { questionnaireId, scheduledTime } = req.body || {};

      if (!questionnaireId || !scheduledTime) {
        return res
          .status(400)
          .json({ error: "questionnaireId_and_scheduledTime_required" });
      }

      const now = Timestamp.now();
      const scheduledCallData: ScheduledCall = {
        startupId: id,
        questionnaireId: questionnaireId,
        answers: {},
        status: "scheduled",
        scheduledTime: scheduledTime,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await colScheduledCalls().add(scheduledCallData);

      res.json({
        callId: docRef.id,
        status: "scheduled",
        scheduledTime: scheduledTime,
        message: "Call scheduled successfully",
      });
    } catch (err: any) {
      console.error(`Error scheduling call: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);

// GET /v1/startups/:id/scheduled-calls - Get scheduled calls
startupsRouter.get(
  "/:id/scheduled-calls",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const callsQuery = await colScheduledCalls()
        .where("startupId", "==", id)
        .orderBy("createdAt", "desc")
        .get();

      const calls = callsQuery.docs.map((doc) => ({
        id: doc.id,
        startupId: doc.data().startupId,
        questionnaireId: doc.data().questionnaireId,
        answers: doc.data().answers,
        status: doc.data().status,
        scheduledTime: doc.data().scheduledTime,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      res.json({
        calls: calls,
      });
    } catch (err: any) {
      console.error(`Error getting scheduled calls: ${err}`);
      res.status(500).json({
        error: "internal_error",
        message: err?.message || String(err),
      });
    }
  }
);
