import { getGroqClient, GROQ_MODEL } from "./groqClient";
import {
  buildAnswerPrompt,
  type UnlockedSource,
} from "./buildAnswerPrompt";

/**
 * Generate a grounded answer from the unlocked source material via Groq.
 * Throws if the key is missing or the model returns no content, so the ask
 * route can surface a clean error instead of returning an empty answer.
 */
export async function generateGroundedAnswer(
  question: string,
  sources: UnlockedSource[],
): Promise<string> {
  const messages = buildAnswerPrompt(question, sources);

  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: 0.2,
  });

  const answer = completion.choices[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error("The model returned an empty answer.");
  }
  return answer;
}
