/**
 * Environment configuration
 */

// Get the Google Cloud project ID from environment variable or use a default
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "startup-analyst-dev-f6c623";

// Get the agent base URL from environment variable or use a default
const agentBaseUrl = process.env.AGENT_BASE_URL || "mock";

// Get the chatbot base URL from environment variable or use a default
const chatbotBaseUrl = process.env.CHATBOT_BASE_URL || "mock";

// Get the GCS bucket name from environment variable or use a default
const gcsBucket = process.env.GCS_BUCKET || "startup-analyst-uploads";

// Get the Pub/Sub topic for ingestion from environment variable or use a default
const pubsubTopicIngestion = process.env.PUBSUB_TOPIC_INGESTION || "startup-analyst-ingestion";

// Export the environment configuration
export const env = {
  projectId,
  agentBaseUrl,
  chatbotBaseUrl,
  gcsBucket,
  pubsubTopicIngestion,
};
