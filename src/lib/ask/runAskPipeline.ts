import { listSourcesWithContent } from "@/lib/queries/listSourcesWithContent";
import { rankSources } from "@/lib/retrieval/rankSources";
import { accessSourceContent } from "@/lib/payments/x402Client";
import { generateGroundedAnswer } from "@/lib/ai/generateGroundedAnswer";
import { generateGeneralAnswer } from "@/lib/ai/generateGeneralAnswer";
import type { UnlockedSource } from "@/lib/ai/buildAnswerPrompt";
import { createQuerySession } from "@/lib/queries/createQuerySession";
import { attachCitations } from "@/lib/queries/attachCitations";
import { createReceipt } from "@/lib/queries/createReceipt";
import { markSessionComplete } from "@/lib/queries/markSessionComplete";
import { createOrBumpDemandSignal } from "@/lib/queries/createOrBumpDemandSignal";
import { executeScribePayment } from "@/lib/payments/executeScribePayment";
import { sumUsd } from "@/lib/format/usd";
import type { AskCitation, AskResponse } from "@/lib/types/query";
import type { RankedSource } from "@/lib/retrieval/rankSources";

// One ranked source after the agent has paid to unlock its content via x402.
type UnlockedRanked = {
  ranked: RankedSource;
  unlocked: UnlockedSource;
  amountUsd: string;
};

// Step 5: pay each top source through the x402 handshake and collect content.
async function unlockSources(
  baseUrl: string,
  ranked: RankedSource[],
): Promise<UnlockedRanked[]> {
  const results: UnlockedRanked[] = [];
  for (const entry of ranked) {
    const access = await accessSourceContent({
      baseUrl,
      sourceId: entry.source.id,
    });
    results.push({
      ranked: entry,
      unlocked: {
        title: access.title,
        authorName: access.authorName,
        content: access.content,
      },
      amountUsd: access.payment.amountUsd,
    });
  }
  return results;
}

/**
 * General-knowledge fallback (CLAUDE.md hybrid extension). Runs when no
 * registered source is relevant: the agent still answers, but from its own
 * knowledge — so it pays no one and writes no receipt. The question is logged as
 * a demand signal so creators can register content for it (see /demand).
 */
async function runGeneralPath(question: string): Promise<AskResponse> {
  const answer = await generateGeneralAnswer(question);

  const querySessionId = await createQuerySession({
    question,
    answer,
    totalPaymentUsd: "0.00",
  });
  await markSessionComplete(querySessionId, "UNSOURCED");
  await createOrBumpDemandSignal(question);

  return {
    success: true,
    sourced: false,
    querySessionId,
    answer,
    citations: [],
    totalPaymentUsd: "0.00",
    receipt: null,
  };
}

/**
 * The autonomous ask pipeline (CLAUDE.md §10, hybrid extension). Ranks sources;
 * if a relevant source matches it pays to unlock the top matches via x402 and
 * grounds the answer (citations + receipt). If none matches it falls back to a
 * general-knowledge answer with no payment. No human payment confirmation.
 */
export async function runAskPipeline(
  question: string,
  baseUrl: string,
): Promise<AskResponse> {
  const sources = await listSourcesWithContent();
  if (sources.length === 0) {
    // Nothing registered yet — still answer, from general knowledge.
    return runGeneralPath(question);
  }

  const { ranked, empty } = rankSources(sources, question);
  if (empty) {
    // No source is relevant — fall back to general knowledge, pay no one.
    return runGeneralPath(question);
  }

  const unlocked = await unlockSources(baseUrl, ranked);
  const answer = await generateGroundedAnswer(
    question,
    unlocked.map((entry) => entry.unlocked),
  );

  const totalPaymentUsd = sumUsd(unlocked.map((entry) => entry.amountUsd));
  const querySessionId = await createQuerySession({
    question,
    answer,
    totalPaymentUsd,
  });

  await attachCitations(
    querySessionId,
    unlocked.map((entry) => ({
      sourceId: entry.ranked.source.id,
      relevanceScore: entry.ranked.score,
    })),
  );

  // Settle the aggregated micropayment and record the receipt exactly the same
  // way for mock or real mode (only isMock differs).
  const payment = await executeScribePayment({
    querySessionId,
    citations: unlocked.map((entry) => ({
      sourceId: entry.ranked.source.id,
      payoutAddress: entry.ranked.source.payoutAddress,
      amountUsd: entry.amountUsd,
    })),
  });

  if (!payment.success) {
    // Surface the provider's reason so a FAILED receipt is diagnosable in the
    // server logs (the receipt row itself only records status = FAILED).
    console.error(
      `[ask] payment failed for session ${querySessionId}: ${payment.error ?? "unknown error"}`,
    );
  }

  const receipt = await createReceipt({
    querySessionId,
    totalAmountUsd: totalPaymentUsd,
    status: payment.success ? "SUCCEEDED" : "FAILED",
    txHash: payment.txHash ?? null,
    // On failure, record the provider's reason as the reference so the FAILED
    // receipt is self-diagnosing without needing the server logs.
    providerReference: payment.success
      ? (payment.providerReference ?? null)
      : (payment.error ?? "unknown error"),
    isMock: payment.isMock,
  });

  await markSessionComplete(querySessionId, payment.success ? "PAID" : "FAILED");

  const citations: AskCitation[] = unlocked.map((entry) => ({
    sourceId: entry.ranked.source.id,
    title: entry.ranked.source.title,
    authorName: entry.ranked.source.authorName,
    pricePerUseUsd: entry.amountUsd,
    relevanceScore: entry.ranked.score,
  }));

  return {
    success: true,
    sourced: true,
    querySessionId,
    answer,
    citations,
    totalPaymentUsd,
    receipt: {
      id: receipt.id,
      txHash: receipt.txHash,
      status: receipt.status,
      isMock: receipt.isMock,
    },
  };
}
