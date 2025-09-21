import { Router, Request, Response } from "express";
import { colUsers, colDealNotes, colPitchDecks, colQuestionnaires, colFounderAnswers } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";
import { spawn } from "child_process";
import path from "path";

export const startupAnalystRouter = Router();

// POST /v1/startup-analyst/run - Run Startup-Analyst for a startup
startupAnalystRouter.post("/run", async (req: Request, res: Response) => {
  try {
    const { startupId, companyName, companyWebsite, pitchDeckId, questionnaireId, sector } = req.body || {};
    
    if (!startupId || !companyName || !companyWebsite) {
      return res.status(400).json({ 
        error: "startupId_companyName_companyWebsite_required",
        message: "startupId, companyName, and companyWebsite are required"
      });
    }

    console.log(`Starting Startup-Analyst for ${companyName} (${startupId})`);
    console.log(`Company Website: ${companyWebsite}`);
    console.log(`Pitch Deck ID: ${pitchDeckId || 'None'}`);
    console.log(`Questionnaire ID: ${questionnaireId || 'None'}`);
    console.log(`Sector: ${sector || 'vr'}`);

    // Get startup details from database
    const startupDoc = await colUsers().doc(startupId).get();
    if (!startupDoc.exists) {
      return res.status(404).json({ error: "startup_not_found" });
    }

    const startupData = startupDoc.data();
    console.log(`Found startup: ${startupData?.name}`);

    // Prepare the command to run Startup-Analyst
    const scriptPath = path.join(__dirname, "../../../backend_startup_analyst_integration.py");
    const args = [
      startupId,
      companyName,
      companyWebsite,
      pitchDeckId || "",
      questionnaireId || ""
    ];

    console.log(`Running command: python3 ${scriptPath} ${args.join(' ')}`);

    // Run the Startup-Analyst integration script
    const pythonProcess = spawn("python3", [scriptPath, ...args], {
      cwd: path.join(__dirname, "../../../.."),
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log(`Startup-Analyst stdout: ${data.toString()}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(`Startup-Analyst stderr: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`Startup-Analyst process exited with code ${code}`);
      
      if (code === 0) {
        console.log("Startup-Analyst completed successfully");
        res.json({
          success: true,
          message: `Startup-Analyst completed successfully for ${companyName}`,
          startupId,
          companyName,
          companyWebsite,
          output: stdout,
          sector: sector || "vr"
        });
      } else {
        console.error(`Startup-Analyst failed with exit code ${code}`);
        res.status(500).json({
          success: false,
          error: "startup_analyst_failed",
          message: `Startup-Analyst failed with exit code ${code}`,
          startupId,
          companyName,
          stderr: stderr,
          stdout: stdout
        });
      }
    });

    pythonProcess.on("error", (error) => {
      console.error(`Failed to start Startup-Analyst process: ${error}`);
      res.status(500).json({
        success: false,
        error: "process_start_failed",
        message: `Failed to start Startup-Analyst process: ${error.message}`,
        startupId,
        companyName
      });
    });

  } catch (err: any) {
    console.error(`Error running Startup-Analyst: ${err}`);
    res.status(500).json({ 
      error: "internal_error", 
      message: err?.message || String(err) 
    });
  }
});

// POST /v1/startup-analyst/trigger-after-call - Trigger after scheduled call completion
startupAnalystRouter.post("/trigger-after-call", async (req: Request, res: Response) => {
  try {
    const { startupId, questionnaireId } = req.body || {};
    
    if (!startupId || !questionnaireId) {
      return res.status(400).json({ 
        error: "startupId_questionnaireId_required",
        message: "startupId and questionnaireId are required"
      });
    }

    // Get startup details
    const startupDoc = await colUsers().doc(startupId).get();
    if (!startupDoc.exists) {
      return res.status(404).json({ error: "startup_not_found" });
    }

    const startupData = startupDoc.data();
    const companyName = startupData?.name || "Unknown Company";
    const companyWebsite = startupData?.companyWebsite || "";

    // Get questionnaire answers
    const answersQuery = await colFounderAnswers().where("questionnaireId", "==", questionnaireId).get();
    if (answersQuery.empty) {
      return res.status(404).json({ error: "questionnaire_answers_not_found" });
    }

    const answersDoc = answersQuery.docs[0];
    const answersData = answersDoc.data();
    console.log(`Found questionnaire answers for ${companyName}`);

    // Get pitch deck if available
    const pitchDeckQuery = await colPitchDecks().where("startupId", "==", startupId).get();
    let pitchDeckId = null;
    if (!pitchDeckQuery.empty) {
      pitchDeckId = pitchDeckQuery.docs[0].id;
      console.log(`Found pitch deck: ${pitchDeckId}`);
    }

    // Trigger Startup-Analyst
    const scriptPath = path.join(__dirname, "../../../backend_startup_analyst_integration.py");
    const args = [
      startupId,
      companyName,
      companyWebsite,
      pitchDeckId || "",
      questionnaireId
    ];

    console.log(`Triggering Startup-Analyst after call completion for ${companyName}`);

    // Run the Startup-Analyst integration script
    const pythonProcess = spawn("python3", [scriptPath, ...args], {
      cwd: path.join(__dirname, "../../../.."),
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log(`Startup-Analyst stdout: ${data.toString()}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(`Startup-Analyst stderr: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`Startup-Analyst process exited with code ${code}`);
      
      if (code === 0) {
        console.log("Startup-Analyst completed successfully after call");
        res.json({
          success: true,
          message: `Startup-Analyst completed successfully for ${companyName} after call completion`,
          startupId,
          companyName,
          companyWebsite,
          questionnaireId,
          pitchDeckId,
          output: stdout
        });
      } else {
        console.error(`Startup-Analyst failed with exit code ${code}`);
        res.status(500).json({
          success: false,
          error: "startup_analyst_failed",
          message: `Startup-Analyst failed with exit code ${code}`,
          startupId,
          companyName,
          stderr: stderr,
          stdout: stdout
        });
      }
    });

    pythonProcess.on("error", (error) => {
      console.error(`Failed to start Startup-Analyst process: ${error}`);
      res.status(500).json({
        success: false,
        error: "process_start_failed",
        message: `Failed to start Startup-Analyst process: ${error.message}`,
        startupId,
        companyName
      });
    });

  } catch (err: any) {
    console.error(`Error triggering Startup-Analyst after call: ${err}`);
    res.status(500).json({ 
      error: "internal_error", 
      message: err?.message || String(err) 
    });
  }
});

// GET /v1/startup-analyst/status/:startupId - Get Startup-Analyst status for a startup
startupAnalystRouter.get("/status/:startupId", async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    
    // Check if deal note exists for this startup
    const dealNoteQuery = await colDealNotes().where("startupId", "==", startupId).get();
    
    if (dealNoteQuery.empty) {
      return res.json({
        hasDealNote: false,
        message: "No deal note found for this startup"
      });
    }

    const dealNoteDoc = dealNoteQuery.docs[0];
    const dealNoteData = dealNoteDoc.data();
    
    res.json({
      hasDealNote: true,
      dealNoteId: dealNoteDoc.id,
      createdAt: dealNoteData.createdAt?.toDate(),
      updatedAt: dealNoteData.updatedAt?.toDate(),
      score: dealNoteData.dealNote?.score?.total || null,
      company: dealNoteData.dealNote?.company || null
    });

  } catch (err: any) {
    console.error(`Error getting Startup-Analyst status: ${err}`);
    res.status(500).json({ 
      error: "internal_error", 
      message: err?.message || String(err) 
    });
  }
});
