// Builds the Groq chat messages for a grounded answer. See CLAUDE.md §12.
// The system prompt is fixed and MUST NOT be altered. Source material is passed
// as user-turn context blocks, never folded into the system prompt.

export type ChatMessage = { role: "system" | "user"; content: string };

// Source content unlocked via the x402 handshake, ready to ground an answer.
export type UnlockedSource = {
  title: string;
  authorName: string;
  content: string;
};

export const SCRIBE_SYSTEM_PROMPT =
  "You are Scribe, a citation-grounded AI assistant. Answer questions using ONLY the source material provided below. Do not use outside knowledge. If the provided sources are insufficient to answer the question, say so clearly. Reference sources inline as [Source 1], [Source 2], etc.";

// Render the unlocked sources into a single numbered context block. The numbers
// here are exactly the [Source N] labels the model is told to cite.
function renderSources(sources: UnlockedSource[]): string {
  return sources
    .map((source, index) => {
      const n = index + 1;
      return [
        `[Source ${n}] "${source.title}" — ${source.authorName}`,
        source.content,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

/**
 * Assemble the system + user messages for the grounded answer. The user turn
 * carries both the source context and the question.
 */
export function buildAnswerPrompt(
  question: string,
  sources: UnlockedSource[],
): ChatMessage[] {
  const userContent = [
    "Source material:",
    "",
    renderSources(sources),
    "",
    "---",
    "",
    `Question: ${question}`,
  ].join("\n");

  return [
    { role: "system", content: SCRIBE_SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ];
}
