import { prisma } from "@/lib/db/prisma";

// One cited source row to attach to a query session (CLAUDE.md §10 step 9).
export type CitationInput = {
  sourceId: string;
  relevanceScore: number;
  excerptUsed?: string | null;
};

/**
 * Attach the cited sources to a query session in a single batch insert.
 * Returns the number of citation rows created.
 */
export async function attachCitations(
  querySessionId: string,
  citations: CitationInput[],
): Promise<number> {
  if (citations.length === 0) return 0;

  const result = await prisma.citation.createMany({
    data: citations.map((citation) => ({
      querySessionId,
      sourceId: citation.sourceId,
      relevanceScore: citation.relevanceScore,
      excerptUsed: citation.excerptUsed ?? null,
    })),
  });
  return result.count;
}
