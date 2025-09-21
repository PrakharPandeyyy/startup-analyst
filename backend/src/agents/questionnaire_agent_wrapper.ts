import axios from "axios";
import { env } from "../config/env";
import { colQuestionnaires } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

/**
 * Wrapper for the Questionnaire Agent
 */
export class QuestionnaireAgentWrapper {
  private baseUrl: string;
  private mockMode: boolean;

  constructor() {
    this.baseUrl = env.agentBaseUrl;
    this.mockMode = this.baseUrl === "mock";
    console.log(
      `QuestionnaireAgentWrapper initialized with baseUrl=${this.baseUrl}, mockMode=${this.mockMode}`
    );
  }

  /**
   * Generate a questionnaire for a startup
   * @param startupId The startup ID
   * @param noteId The note ID to base the questionnaire on
   */
  async generateQuestionnaire(
    startupId: string,
    noteId: string
  ): Promise<string> {
    try {
      console.log(
        `Generating questionnaire for startup ${startupId} based on note ${noteId}`
      );

      if (this.mockMode) {
        console.log("Using mock implementation for questionnaire generation");
        return this.createMockQuestionnaire(startupId, noteId);
      }

      // Call the agent server
      const response = await axios.post(`${this.baseUrl}/api/questionnaire`, {
        startupId,
        noteId,
      });

      // Save the questionnaire to Firestore
      const questionnaire = response.data.questionnaire;

      const now = Timestamp.now();
      const doc = await colQuestionnaires().add({
        startupId,
        noteId,
        version: 1,
        schemaVersion: "v1",
        questions: questionnaire.questions,
        status: "ready",
        createdAt: now,
        updatedAt: now,
      } as any);

      return doc.id;
    } catch (err: any) {
      console.error(`Error generating questionnaire: ${err}`);
      throw new Error(
        `Questionnaire generation failed: ${err.message || String(err)}`
      );
    }
  }

  /**
   * Get assistance for answering a questionnaire question
   * @param questionnaireId The questionnaire ID
   * @param question The question text
   */
  async getQuestionnaireAssistance(
    questionnaireId: string,
    question: string
  ): Promise<string> {
    try {
      console.log(
        `Getting assistance for question in questionnaire ${questionnaireId}: ${question}`
      );

      if (this.mockMode) {
        console.log("Using mock implementation for questionnaire assistance");
        return this.getMockQuestionnaireAssistance(question);
      }

      // Get the questionnaire
      const questionnaireDoc = await colQuestionnaires()
        .doc(questionnaireId)
        .get();
      if (!questionnaireDoc.exists) {
        throw new Error(`Questionnaire ${questionnaireId} not found`);
      }

      // Call the agent server
      const response = await axios.post(
        `${this.baseUrl}/api/questionnaire/assist`,
        {
          questionnaireId,
          question,
        }
      );

      return response.data.answer;
    } catch (err: any) {
      console.error(`Error getting questionnaire assistance: ${err}`);
      throw new Error(
        `Questionnaire assistance failed: ${err.message || String(err)}`
      );
    }
  }

  /**
   * Create a mock questionnaire
   * @param startupId The startup ID
   * @param noteId The note ID
   */
  private async createMockQuestionnaire(
    startupId: string,
    noteId: string
  ): Promise<string> {
    const now = Timestamp.now();
    const questionnaire = {
      startupId,
      noteId,
      version: 1,
      schemaVersion: "v1",
      questions: [
        {
          id: "q1",
          text: "What is your total addressable market size?",
          category: "market",
          type: "open",
        },
        {
          id: "q2",
          text: "How many active users/customers do you have?",
          category: "traction",
          type: "open",
        },
        {
          id: "q3",
          text: "Who are your top 3 competitors and how do you differentiate?",
          category: "competition",
          type: "open",
        },
        {
          id: "q4",
          text: "What relevant experience does your founding team have?",
          category: "team",
          type: "open",
        },
        {
          id: "q5",
          text: "What is your product roadmap for the next 12 months?",
          category: "product",
          type: "open",
        },
        {
          id: "q6",
          text: "What are your current unit economics?",
          category: "finance",
          type: "open",
        },
        {
          id: "q7",
          text: "How do you plan to use the funds you're raising?",
          category: "fundraising",
          type: "open",
        },
      ],
      status: "ready",
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore
    const doc = await colQuestionnaires().add(questionnaire as any);
    console.log(`Created mock questionnaire with ID: ${doc.id}`);

    return doc.id;
  }

  /**
   * Get mock assistance for a questionnaire question
   * @param question The question text
   */
  private getMockQuestionnaireAssistance(question: string): string {
    const keywords = question.toLowerCase();

    if (keywords.includes("market size") || keywords.includes("tam")) {
      return (
        "To answer the market size question effectively:\n\n" +
        "Be specific about your TAM/SAM/SOM with credible sources. Explain how you arrived at these numbers and why your segment is attractive.\n\n" +
        "Include:\n" +
        "- Total addressable market (TAM) with source (e.g., Gartner, McKinsey)\n" +
        "- Serviceable addressable market (SAM)\n" +
        "- Serviceable obtainable market (SOM)\n" +
        "- Growth rate (CAGR) with source\n" +
        "- Key market drivers and trends"
      );
    }

    if (
      keywords.includes("traction") ||
      keywords.includes("customers") ||
      keywords.includes("users")
    ) {
      return (
        "For the traction metrics question:\n\n" +
        "Focus on concrete metrics like MRR, growth rate, and customer acquisition. Investors want to see evidence of product-market fit and scalability.\n\n" +
        "Include:\n" +
        "- Revenue metrics (ARR/MRR) and growth rate\n" +
        "- Customer count and growth rate\n" +
        "- User engagement metrics\n" +
        "- CAC, LTV, and payback period\n" +
        "- Conversion rates at each funnel stage"
      );
    }

    if (keywords.includes("competitor") || keywords.includes("differentiate")) {
      return (
        "For the competition question:\n\n" +
        "Don't just list competitors - explain your unique advantages. Create a matrix showing how you compare on key factors that matter to customers.\n\n" +
        "Include:\n" +
        "- Direct and indirect competitors\n" +
        "- Your key differentiators and why they matter\n" +
        "- Competitive moats and barriers to entry\n" +
        "- Why customers choose you over alternatives\n" +
        "- How you plan to maintain your competitive advantage"
      );
    }

    if (
      keywords.includes("team") ||
      keywords.includes("founder") ||
      keywords.includes("experience")
    ) {
      return (
        "For the team experience question:\n\n" +
        "Highlight relevant domain expertise and previous startup experience. Explain why your team is uniquely positioned to solve this problem.\n\n" +
        "Include:\n" +
        "- Relevant industry experience\n" +
        "- Technical expertise and credentials\n" +
        "- Previous startup experience (especially exits)\n" +
        "- How long the team has worked together\n" +
        "- Key advisors and their contributions"
      );
    }

    if (keywords.includes("product") || keywords.includes("roadmap")) {
      return (
        "For the product roadmap question:\n\n" +
        "Describe your product differentiation and technical moats. Share customer testimonials and usage metrics that demonstrate value.\n\n" +
        "Include:\n" +
        "- Current product status and key features\n" +
        "- Planned features and timeline\n" +
        "- How roadmap aligns with customer needs\n" +
        "- Technical challenges and solutions\n" +
        "- IP protection strategy"
      );
    }

    if (keywords.includes("unit") || keywords.includes("economics")) {
      return (
        "For the unit economics question:\n\n" +
        "Be transparent about your unit economics and path to profitability. Include CAC, LTV, payback period, and gross margins.\n\n" +
        "Include:\n" +
        "- Customer acquisition cost (CAC)\n" +
        "- Lifetime value (LTV)\n" +
        "- LTV/CAC ratio\n" +
        "- Gross margin\n" +
        "- Payback period\n" +
        "- Path to profitability"
      );
    }

    if (
      keywords.includes("funds") ||
      keywords.includes("raising") ||
      keywords.includes("use")
    ) {
      return (
        "For the fundraising question:\n\n" +
        "Clearly tie your fundraising amount to specific milestones. Show how this round gets you to the next inflection point.\n\n" +
        "Include:\n" +
        "- Specific allocation of funds (e.g., 40% engineering, 30% sales)\n" +
        "- Key milestones this funding will help you achieve\n" +
        "- Runway this funding provides\n" +
        "- How these milestones set you up for the next round\n" +
        "- Expected valuation increase after achieving these milestones"
      );
    }

    return (
      "Here's how you might approach answering this question:\n\n" +
      "Investors are looking for specific metrics and clear explanations. Make sure to include concrete numbers and examples in your response.\n\n" +
      "Focus on your key differentiators and market position. Provide specific metrics and examples rather than general statements."
    );
  }
}
