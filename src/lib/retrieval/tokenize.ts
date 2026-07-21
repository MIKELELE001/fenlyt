// Lightweight keyword tokenizer for retrieval scoring. See CLAUDE.md §11.
// Lowercases, splits on non-alphanumerics, drops very short terms and a small
// stopword set so common words don't dominate keyword overlap.

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "was",
  "were",
  "with",
  "that",
  "this",
  "from",
  "what",
  "which",
  "who",
  "how",
  "why",
  "when",
  "where",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "about",
  "into",
  "over",
  "your",
  "you",
  "our",
  "their",
  "its",
  "has",
  "have",
  "had",
]);

/**
 * Tokenize text into a list of lowercase keyword terms (order preserved,
 * duplicates kept — callers dedupe when they need a unique set).
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 3 && !STOPWORDS.has(term));
}

/** Tokenize and return the unique set of terms. */
export function uniqueTerms(text: string): string[] {
  return Array.from(new Set(tokenize(text)));
}
