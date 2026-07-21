import Groq from "groq-sdk";

// Groq model locked by spec (CLAUDE.md §2 / §12). Shared by both the grounded
// and general-knowledge answer generators.
export const GROQ_MODEL = "llama-3.3-70b-versatile";

// Lazily construct the client so a missing key only fails an ask request, not
// module import / build. Server-side only — GROQ_API_KEY is never public.
let client: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }
  if (!client) client = new Groq({ apiKey });
  return client;
}
