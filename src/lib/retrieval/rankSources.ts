import { scoreSources, type RankedSource } from "./scoreSources";
import type { SourceWithContent } from "@/lib/queries/getSourceById";

export type { RankedSource } from "./scoreSources";

// How many sources the agent will pay for and ground its answer in.
export const MAX_RANKED_SOURCES = 3;

export type RankResult = {
  ranked: RankedSource[];
  // True when no source shares any keyword with the question (top score === 0).
  empty: boolean;
};

/**
 * Rank sources by keyword relevance to the question and take the top N.
 * Returns `empty: true` when even the best match scores zero, so the ask
 * pipeline can short-circuit before paying for anything (CLAUDE.md §10 step 4).
 */
export function rankSources(
  sources: SourceWithContent[],
  question: string,
): RankResult {
  const scored = scoreSources(sources, question)
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const ranked = scored.slice(0, MAX_RANKED_SOURCES);
  return { ranked, empty: ranked.length === 0 };
}
