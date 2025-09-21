import axios from "axios";
import { env } from "../config/env";
import { colMessages } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

/**
 * Wrapper for the Startup-Chatbot server
 */
export class ChatbotWrapper {
  private baseUrl: string;
  private mockMode: boolean;

  constructor() {
    this.baseUrl = env.chatbotBaseUrl;
    this.mockMode = this.baseUrl === "mock";
    console.log(
      `ChatbotWrapper initialized with baseUrl=${this.baseUrl}, mockMode=${this.mockMode}`
    );
  }

  /**
   * Process a message for the deal screener bot
   * @param sessionId The session ID
   * @param message The message text
   * @returns The bot's reply
   */
  async processDealScreenerMessage(
    sessionId: string,
    message: string
  ): Promise<string> {
    try {
      console.log(
        `Processing deal screener message for session ${sessionId}: ${message}`
      );

      if (this.mockMode) {
        console.log("Using mock implementation for deal screener");
        const reply = this.mockDealScreenerReply(message);

        // Save the message and reply to Firestore
        await this.saveMessage(sessionId, "user", message);
        await this.saveMessage(sessionId, "assistant", reply);

        return reply;
      }

      // Call the chatbot server
      const response = await axios.post(`${this.baseUrl}/api/bots/screener`, {
        message,
        sessionId,
      });

      const reply = response.data.reply;

      // Save the message and reply to Firestore
      await this.saveMessage(sessionId, "user", message);
      await this.saveMessage(sessionId, "assistant", reply);

      return reply;
    } catch (err: any) {
      console.error(`Error processing deal screener message: ${err}`);
      throw new Error(
        `Deal screener processing failed: ${err.message || String(err)}`
      );
    }
  }

  /**
   * Process a message for the deep dive bot
   * @param sessionId The session ID
   * @param message The message text
   * @param dealNoteId The deal note ID
   * @returns The bot's reply
   */
  async processDeepDiveMessage(
    sessionId: string,
    message: string,
    dealNoteId?: string
  ): Promise<string> {
    try {
      console.log(
        `Processing deep dive message for session ${sessionId}: ${message}`
      );

      if (this.mockMode) {
        console.log("Using mock implementation for deep dive");
        const reply = this.mockDeepDiveReply(message);

        // Save the message and reply to Firestore
        await this.saveMessage(sessionId, "user", message);
        await this.saveMessage(sessionId, "assistant", reply);

        return reply;
      }

      // Call the chatbot server
      const response = await axios.post(`${this.baseUrl}/api/bots/deep-dive`, {
        message,
        sessionId,
        dealNoteId,
      });

      const reply = response.data.reply;

      // Save the message and reply to Firestore
      await this.saveMessage(sessionId, "user", message);
      await this.saveMessage(sessionId, "assistant", reply);

      return reply;
    } catch (err: any) {
      console.error(`Error processing deep dive message: ${err}`);
      throw new Error(
        `Deep dive processing failed: ${err.message || String(err)}`
      );
    }
  }

  /**
   * Process a message for the questionnaire bot
   * @param sessionId The session ID
   * @param message The message text
   * @param questionnaireId The questionnaire ID
   * @returns The bot's reply
   */
  async processQuestionnaireMessage(
    sessionId: string,
    message: string,
    questionnaireId: string
  ): Promise<string> {
    try {
      console.log(
        `Processing questionnaire message for session ${sessionId}, questionnaire ${questionnaireId}: ${message}`
      );

      if (this.mockMode) {
        console.log("Using mock implementation for questionnaire");
        const reply = this.mockQuestionnaireReply(message);

        // Save the message and reply to Firestore
        await this.saveMessage(sessionId, "user", message);
        await this.saveMessage(sessionId, "assistant", reply);

        return reply;
      }

      // Call the chatbot server
      const response = await axios.post(
        `${this.baseUrl}/api/questionnaire/assist`,
        {
          question: message,
          questionnaireId,
        }
      );

      const reply = response.data.answer;

      // Save the message and reply to Firestore
      await this.saveMessage(sessionId, "user", message);
      await this.saveMessage(sessionId, "assistant", reply);

      return reply;
    } catch (err: any) {
      console.error(`Error processing questionnaire message: ${err}`);
      throw new Error(
        `Questionnaire processing failed: ${err.message || String(err)}`
      );
    }
  }

  /**
   * Save a message to Firestore
   * @param sessionId The session ID
   * @param role The role (user or assistant)
   * @param text The message text
   */
  private async saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    text: string
  ): Promise<void> {
    try {
      await colMessages().add({
        sessionId,
        role,
        text,
        createdAt: Timestamp.now(),
      } as any);
    } catch (err) {
      console.error(`Error saving message: ${err}`);
    }
  }

  /**
   * Generate a mock reply for the deal screener bot
   * @param message The message text
   * @returns A mock reply
   */
  private mockDealScreenerReply(message: string): string {
    const keywords = message.toLowerCase();

    if (keywords.includes("healthcare") || keywords.includes("health")) {
      return (
        "Here are some AI startups in the healthcare sector:\n\n" +
        "1. MediMind AI - Healthcare diagnostics, Score: 8.7/10\n" +
        "2. BioTechAI - Drug discovery platform, Score: 8.2/10\n" +
        "3. CareBot - Patient monitoring system, Score: 7.9/10"
      );
    }

    if (keywords.includes("fintech") || keywords.includes("finance")) {
      return (
        "Here are some AI startups in the fintech sector:\n\n" +
        "1. AlgoTrade - AI trading platform, Score: 8.5/10\n" +
        "2. FraudShield - Fraud detection system, Score: 8.3/10\n" +
        "3. WealthBot - Automated financial advisor, Score: 7.8/10"
      );
    }

    return (
      "Here are some AI startups with strong traction:\n\n" +
      "1. DataMind - NLP for enterprise, Score: 8.9/10\n" +
      "2. RoboVision - Computer vision platform, Score: 8.6/10\n" +
      "3. CloudAI - ML infrastructure, Score: 8.4/10\n" +
      "4. NeuralSystems - AI chip design, Score: 8.1/10\n" +
      "5. SynthGen - Synthetic data generation, Score: 7.9/10"
    );
  }

  /**
   * Generate a mock reply for the deep dive bot
   * @param message The message text
   * @returns A mock reply
   */
  private mockDeepDiveReply(message: string): string {
    const keywords = message.toLowerCase();

    if (keywords.includes("team") || keywords.includes("founder")) {
      return (
        "The founding team has strong technical credentials:\n\n" +
        "- CEO: Former ML research lead at Google with PhD in Computer Science\n" +
        "- CTO: 15+ years experience building scalable AI systems\n" +
        "- CPO: Previously founded and exited a B2B SaaS startup\n" +
        "- The team has worked together for 3+ years before founding"
      );
    }

    if (keywords.includes("market") || keywords.includes("opportunity")) {
      return (
        "Market analysis:\n\n" +
        "- Total addressable market (TAM): $45B by 2027\n" +
        "- Growing at 32% CAGR\n" +
        "- Current penetration is only 8%\n" +
        "- Key growth drivers: enterprise AI adoption, regulatory changes, cloud migration"
      );
    }

    if (keywords.includes("competitor") || keywords.includes("competition")) {
      return (
        "Competitive landscape:\n\n" +
        "- 3 main competitors: BigAI (public), TechML (Series C), SmartSys (Series B)\n" +
        "- Key differentiator: proprietary algorithm with 40% better performance\n" +
        "- Barriers to entry: 2 pending patents, exclusive data partnerships\n" +
        "- Pricing advantage: 30% lower TCO than closest competitor"
      );
    }

    return (
      "Company overview:\n\n" +
      "- Founded in 2023, headquartered in San Francisco\n" +
      "- Strong technical team with previous exits\n" +
      "- Product: AI platform for automated decision-making\n" +
      "- Traction: $1.2M ARR, growing 25% MoM\n" +
      "- 35 enterprise customers including 2 Fortune 500\n" +
      "- Key metrics: 92% gross retention, 130% net retention\n" +
      "- Main risks: scaling sales team, potential regulatory changes"
    );
  }

  /**
   * Generate a mock reply for the questionnaire bot
   * @param message The message text
   * @returns A mock reply
   */
  private mockQuestionnaireReply(message: string): string {
    const keywords = message.toLowerCase();

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

    if (keywords.includes("traction") || keywords.includes("metrics")) {
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

    return (
      "Here's how you might approach answering this question:\n\n" +
      "Investors are looking for specific metrics and clear explanations. Make sure to include concrete numbers and examples in your response.\n\n" +
      "Focus on your key differentiators and market position. Provide specific metrics and examples rather than general statements."
    );
  }
}
