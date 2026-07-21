import { tokenize, uniqueTerms } from "./tokenize";
import type { SourceWithContent } from "@/lib/queries/getSourceById";

// A source paired with its keyword-relevance score for a given question.
export type RankedSource = {
  source: SourceWithContent;
  score: number;
  matchedTerms: string[];
};

// Scoring weights (CLAUDE.md §11): a term hit in the title counts more than a
// hit in the body.
const TITLE_WEIGHT = 3;
const CONTENT_WEIGHT = 1;

/**
 * Score a single source against a pre-tokenized set of unique question terms.
 * Each matching term contributes TITLE_WEIGHT if present in the title and
 * CONTENT_WEIGHT if present in the content.
 */
export function scoreSource(
  source: SourceWithContent,
  questionTerms: string[],
): RankedSource {
  const titleTerms = new Set(tokenize(source.title));
  const contentTerms = new Set(tokenize(source.content));

  let score = 0;
  const matchedTerms: string[] = [];

  for (const term of questionTerms) {
    let matched = false;
    if (titleTerms.has(term)) {
      score += TITLE_WEIGHT;
      matched = true;
    }
    if (contentTerms.has(term)) {
      score += CONTENT_WEIGHT;
      matched = true;
    }
    if (matched) matchedTerms.push(term);
  }

  return { source, score, matchedTerms };
}

/** Score every source against the question's unique keyword terms. */
export function scoreSources(
  sources: SourceWithContent[],
  question: string,
): RankedSource[] {
  const questionTerms = uniqueTerms(question);
  return sources.map((source) => scoreSource(source, questionTerms));
}
