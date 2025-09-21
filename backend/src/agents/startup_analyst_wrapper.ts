import axios from "axios";
import { env } from "../config/env";
import { colNotes } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

/**
 * Wrapper for the Startup-Analyst agents
 */
export class StartupAnalystWrapper {
  private baseUrl: string;
  private mockMode: boolean;

  constructor() {
    this.baseUrl = env.agentBaseUrl;
    this.mockMode = this.baseUrl === "mock";
    console.log(
      `StartupAnalystWrapper initialized with baseUrl=${this.baseUrl}, mockMode=${this.mockMode}`
    );
  }

  /**
   * Run the ingestion agent to process a pitch deck
   * @param startupId The startup ID
   * @param gcsUri The GCS URI of the pitch deck
   * @param uploadId Optional upload ID reference
   */
  async runIngestion(
    startupId: string,
    gcsUri: string,
    uploadId?: string
  ): Promise<string> {
    try {
      console.log(
        `Running ingestion agent for startup ${startupId} with file ${gcsUri}`
      );

      if (this.mockMode) {
        console.log("Using mock implementation for ingestion");
        return this.createMockIngestionNote(startupId, gcsUri, uploadId);
      }

      // Call the agent server
      const response = await axios.post(`${this.baseUrl}/api/ingestion`, {
        startupId,
        gcsUri,
        uploadId,
      });

      // Save the note to Firestore
      const noteId = response.data.noteId;
      const note = response.data.note;

      const now = Timestamp.now();
      await colNotes().doc(noteId).set({
        startupId,
        version: 1,
        schemaVersion: "v1",
        source: "ingestion_agent",
        summary: "Automatically ingested from pitch deck",
        status: "ready",
        json: note,
        createdAt: now,
        updatedAt: now,
      });

      return noteId;
    } catch (err: any) {
      console.error(`Error running ingestion agent: ${err}`);
      throw new Error(`Ingestion agent failed: ${err.message || String(err)}`);
    }
  }

  /**
   * Run the deep research agent to verify claims
   * @param noteId The note ID to enhance with research
   */
  async runDeepResearch(noteId: string): Promise<void> {
    try {
      console.log(`Running deep research agent for note ${noteId}`);

      // Get the note
      const noteDoc = await colNotes().doc(noteId).get();
      if (!noteDoc.exists) {
        throw new Error(`Note ${noteId} not found`);
      }

      const noteData = noteDoc.data() as any;

      if (this.mockMode) {
        console.log("Using mock implementation for deep research");
        await this.updateNoteWithMockResearch(noteId, noteData);
        return;
      }

      // Call the agent server
      const response = await axios.post(`${this.baseUrl}/api/deep-research`, {
        noteId,
        note: noteData.json,
      });

      // Update the note with verification results
      const verification = response.data.verification;

      await colNotes().doc(noteId).update({
        "json.verification": verification,
        updatedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error(`Error running deep research agent: ${err}`);
      throw new Error(
        `Deep research agent failed: ${err.message || String(err)}`
      );
    }
  }

  /**
   * Run the deal scoring agent to score a startup
   * @param noteId The note ID to score
   */
  async runDealScoring(noteId: string): Promise<void> {
    try {
      console.log(`Running deal scoring agent for note ${noteId}`);

      // Get the note
      const noteDoc = await colNotes().doc(noteId).get();
      if (!noteDoc.exists) {
        throw new Error(`Note ${noteId} not found`);
      }

      const noteData = noteDoc.data() as any;

      if (this.mockMode) {
        console.log("Using mock implementation for deal scoring");
        await this.updateNoteWithMockScoring(noteId, noteData);
        return;
      }

      // Call the agent server
      const response = await axios.post(`${this.baseUrl}/api/deal-scoring`, {
        noteId,
        note: noteData.json,
      });

      // Update the note with scoring results
      const score = response.data.score;

      await colNotes().doc(noteId).update({
        "json.score": score,
        updatedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error(`Error running deal scoring agent: ${err}`);
      throw new Error(
        `Deal scoring agent failed: ${err.message || String(err)}`
      );
    }
  }

  /**
   * Run the full analysis pipeline on a pitch deck
   * @param startupId The startup ID
   * @param gcsUri The GCS URI of the pitch deck
   */
  async runFullAnalysis(startupId: string, gcsUri: string): Promise<string> {
    try {
      console.log(
        `Running full analysis for startup ${startupId} with file ${gcsUri}`
      );

      // Step 1: Run ingestion
      const noteId = await this.runIngestion(startupId, gcsUri);

      // Step 2: Run deep research
      await this.runDeepResearch(noteId);

      // Step 3: Run deal scoring
      await this.runDealScoring(noteId);

      return noteId;
    } catch (err: any) {
      console.error(`Error running full analysis: ${err}`);
      throw new Error(`Full analysis failed: ${err.message || String(err)}`);
    }
  }

  /**
   * Create a mock ingestion note
   * @param startupId The startup ID
   * @param gcsUri The GCS URI of the pitch deck
   * @param uploadId Optional upload ID reference
   */
  private async createMockIngestionNote(
    startupId: string,
    gcsUri: string,
    uploadId?: string
  ): Promise<string> {
    const now = Timestamp.now();
    const note = {
      startupId,
      version: 1,
      schemaVersion: "v1",
      source: "ingestion_agent",
      summary: "Automatically ingested from pitch deck",
      status: "ready",
      json: {
        title: "Deal Note",
        inputs: { gcsUri, uploadId },
        company: startupId,
        sector: "tech",
        facts: {
          name: startupId,
          description: "An AI-powered startup focused on enterprise automation",
          founders: [
            {
              name: "Jane Smith",
              role: "CEO",
              background: "Ex-Google AI researcher",
            },
            {
              name: "John Doe",
              role: "CTO",
              background: "PhD in Machine Learning from Stanford",
            },
          ],
          traction: {
            revenue: { Y1: 500000, Y2: 1200000 },
            customers: 25,
            growth: "140% YoY",
          },
          funding: {
            raised: "$2.5M",
            round: "Seed",
            investors: ["TechVC", "Angel Group"],
          },
          product: {
            stage: "Growth",
            description: "AI platform for business process automation",
          },
          market: {
            size: "$45B by 2027",
            cagr: "32%",
          },
        },
        claims: [
          {
            claim: "40% cost reduction for customers",
            source: "slide 12",
            confidence: "high",
          },
          {
            claim: "Proprietary ML algorithm with 2 patents pending",
            source: "slide 8",
            confidence: "high",
          },
          {
            claim: "85% customer satisfaction rate",
            source: "slide 15",
            confidence: "medium",
          },
          {
            claim: "Market leader in their segment",
            source: "slide 5",
            confidence: "low",
          },
        ],
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore
    const doc = await colNotes().add(note as any);
    console.log(`Created mock note document with ID: ${doc.id}`);

    return doc.id;
  }

  /**
   * Update a note with mock research results
   * @param noteId The note ID
   * @param noteData The note data
   */
  private async updateNoteWithMockResearch(
    noteId: string,
    noteData: any
  ): Promise<void> {
    const verification = noteData.json.claims.map((claim: any) => {
      // Randomly verify claims based on confidence
      const confidence = claim.confidence || "medium";
      let verificationProbability = 0.5;

      if (confidence === "high") {
        verificationProbability = 0.8;
      } else if (confidence === "low") {
        verificationProbability = 0.3;
      }

      const verified = Math.random() < verificationProbability;

      return {
        ...claim,
        verified,
        evidence: verified
          ? [
              {
                source: "web",
                url: "https://example.com/evidence",
                text: `Evidence supporting the claim that ${claim.claim}`,
              },
            ]
          : [],
        analysis: verified
          ? `This claim appears to be accurate based on our research.`
          : `We could not fully verify this claim with available data.`,
      };
    });

    await colNotes().doc(noteId).update({
      "json.verification": verification,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update a note with mock scoring results
   * @param noteId The note ID
   * @param noteData The note data
   */
  private async updateNoteWithMockScoring(
    noteId: string,
    noteData: any
  ): Promise<void> {
    // Generate realistic scores
    const teamScore = 7 + Math.random() * 3;
    const marketScore = 6 + Math.random() * 4;
    const productScore = 7 + Math.random() * 3;
    const tractionScore = 6 + Math.random() * 3;

    // Calculate risk factor (0-1, lower is better)
    const riskFactor = 0.2 + Math.random() * 0.3;

    // Calculate overall score
    const overallScore =
      ((teamScore + marketScore + productScore + tractionScore) / 4) *
      (1 - riskFactor);

    const score = {
      team: parseFloat(teamScore.toFixed(1)),
      market: parseFloat(marketScore.toFixed(1)),
      product: parseFloat(productScore.toFixed(1)),
      traction: parseFloat(tractionScore.toFixed(1)),
      risk: parseFloat(riskFactor.toFixed(2)),
      overall: parseFloat(overallScore.toFixed(1)),
    };

    await colNotes().doc(noteId).update({
      "json.score": score,
      updatedAt: Timestamp.now(),
    });
  }
}
