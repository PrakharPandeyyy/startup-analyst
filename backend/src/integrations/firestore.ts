import { Firestore } from "@google-cloud/firestore";

export const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || "startup-analyst-dev-f6c623",
});

export type User = {
  id?: string;
  email: string;           // Primary identifier
  username: string;        // Display name for login
  password: string;        // Hashed password
  phoneNumber: string;     // Phone number
  name: string;           // Company/Startup name
  role: "startup" | "investor";
  description?: string;
  score?: number;
  category?: string;
  companyWebsite?: string; // Company website URL
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

export type Startup = {
  id?: string;
  name: string;
  description?: string;
  score?: number;
  category?: string;
  companyWebsite?: string; // Company website URL
  slug?: string;           // URL slug
  stage?: string;          // Startup stage
  geography?: string;      // Geographic location
  website?: string;        // Website URL (legacy)
  founders?: any[];        // Founders array
  tags?: string[];         // Tags array
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

export type DealNote = {
  id?: string;
  startupId: string;
  dealNote: any; // The actual deal note JSON
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

export type PitchDeck = {
  id?: string;
  startupId: string;
  fileName: string;
  fileSize?: number;       // Made optional
  contentType: string;
  gcsUri: string;
  sizeBytes?: number;      // Legacy field
  status?: string;         // Upload status
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

export type Questionnaire = {
  id?: string;
  startupId: string;
  pitchDeckId?: string;
  questions: any; // The questionnaire JSON
  version?: number;        // Version field
  schemaVersion?: string;  // Schema version
  status?: string;         // Status field
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

export type ScheduledCall = {
  id?: string;
  startupId: string;
  questionnaireId: string;
  scheduledTime: string;
  phoneNumber?: string; // Optional phone number
  status: "scheduled" | "completed" | "cancelled";
  answers?: any;         // Legacy field
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

export type FounderAnswers = {
  id?: string;
  questionnaireId: string;
  answers: any; // The answers JSON
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

// Collection references
export const colUsers = () => firestore.collection("users");
export const colStartups = () => firestore.collection("startups");
export const colDealNotes = () => firestore.collection("deal_notes");
export const colPitchDecks = () => firestore.collection("pitch_decks");
export const colQuestionnaires = () => firestore.collection("questionnaires");
export const colScheduledCalls = () => firestore.collection("scheduled_calls");
export const colFounderAnswers = () => firestore.collection("founder_answers");

// Legacy collection references for backward compatibility
export const colNotes = () => firestore.collection("deal_notes");
export const colFinalNotes = () => firestore.collection("deal_notes");
export const colSessions = () => firestore.collection("sessions");
export const colMessages = () => firestore.collection("messages");
export const colUploads = () => firestore.collection("uploads");
