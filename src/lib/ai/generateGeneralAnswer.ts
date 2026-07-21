import { getGroqClient, GROQ_MODEL } from "./groqClient";

// Used only when NO registered source is relevant to the question (CLAUDE.md
// hybrid extension). Distinct from the locked grounded SCRIBE_SYSTEM_PROMPT —
// this path answers from the model's own knowledge and pays no one, so it must
// NOT invent [Source N] citations.
const GENERAL_SYSTEM_PROMPT =
  "You are Scribe, a helpful AI assistant. No registered source covered this " +
  "question, so answer from your own general knowledge. Be clear, concise, and " +
  "accurate. Do not fabricate citations or reference any sources — there are " +
  "none for this answer. If you are unsure, say so honestly.";

/**
 * Generate an answer from the model's general knowledge when no registered
 * source matched. Throws if the key is missing or the model returns nothing,
 * so the ask route can surface a clean error.
 */
export async function generateGeneralAnswer(question: string): Promise<string> {
  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: GENERAL_SYSTEM_PROMPT },
      { role: "user", content: question },
    ],
    temperature: 0.3,
  });

  const answer = completion.choices[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error("The model returned an empty answer.");
  }
  return answer;
}
