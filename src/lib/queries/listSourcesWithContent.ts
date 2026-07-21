import { prisma } from "@/lib/db/prisma";
import type { SourceWithContent } from "./getSourceById";

/**
 * Load every source with its full content + payment fields, for the ask
 * pipeline's relevance ranking (CLAUDE.md §10 step 2). Decimal is stringified
 * so the shape matches SourceWithContent throughout retrieval.
 */
export async function listSourcesWithContent(): Promise<SourceWithContent[]> {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      authorName: true,
      content: true,
      payoutAddress: true,
      pricePerUseUsd: true,
    },
  });

  return sources.map((source) => ({
    id: source.id,
    title: source.title,
    authorName: source.authorName,
    content: source.content,
    payoutAddress: source.payoutAddress,
    pricePerUseUsd: source.pricePerUseUsd.toString(),
  }));
}
