import { z } from "zod";

// Ask request schema — shared by the /ask form (client) and the POST /api/ask
// route (server). See CLAUDE.md §14.
export const askSchema = z.object({
  question: z.string().min(5, "Ask a question of at least 5 characters."),
});

export type AskFormValues = z.infer<typeof askSchema>;
