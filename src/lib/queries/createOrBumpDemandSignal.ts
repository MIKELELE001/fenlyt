import { prisma } from "@/lib/db/prisma";

// Collapse a question to a stable dedupe key so re-asks of the same topic bump
// one row's count instead of creating duplicates.
function normalizeQuestion(question: string): string {
  return question.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Record demand for an unmet topic (CLAUDE.md hybrid extension). Called when a
 * question is answered from general knowledge because no source matched. Upserts
 * on the normalized question: first ask creates the row, repeats increment the
 * count and refresh the stored phrasing + lastAskedAt.
 */
export async function createOrBumpDemandSignal(question: string): Promise<void> {
  const normalized = normalizeQuestion(question);
  await prisma.demandSignal.upsert({
    where: { normalized },
    create: { question, normalized },
    update: { count: { increment: 1 }, question },
  });
}
