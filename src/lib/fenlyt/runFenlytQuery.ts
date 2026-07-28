import { getGroqClient, GROQ_MODEL } from "@/lib/ai/groqClient";
import {
  FENLYT_CLASSIFY_PROMPT,
  FENLYT_OUT_OF_SCOPE_MESSAGE,
  FENLYT_SYSTEM_PROMPT,
  buildFenlytPrompt,
  type FenlytDataContext,
} from "@/lib/ai/buildFenlytPrompt";
import {
  getCoinMarketData,
  getTokenRisk,
  getWalletSummary,
  getNews,
} from "@/lib/coinstats/client";
import { executeQueryPayment } from "@/lib/payments/executeQueryPayment";

export type FenlytQueryResult = {
  success: boolean;
  outOfScope: boolean;
  category: string | null;
  entity: string | null;
  answer: string;
  dataUsed: unknown;
  amountUsd: string;
  payment: {
    status: "SUCCEEDED" | "FAILED";
    txHash: string | null;
    isMock: boolean;
  } | null;
};

// Flat fee per query — a placeholder figure for the hackathon demo. Represents
// the pay-per-use pricing pitch (cents instead of a subscription).
const QUERY_FEE_USD = "0.05";

type Classification = {
  category: "token_safety" | "wallet_check" | "sentiment" | "brief" | "out_of_scope";
  entity: string;
};

async function classifyQuestion(question: string): Promise<Classification> {
  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: FENLYT_CLASSIFY_PROMPT },
      { role: "user", content: question },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    const parsed = JSON.parse(raw) as Classification;
    if (!parsed.category) throw new Error("missing category");
    return parsed;
  } catch {
    // If the model doesn't return clean JSON, fail safe into out_of_scope
    // rather than guessing at intent.
    return { category: "out_of_scope", entity: "" };
  }
}

async function fetchDataForCategory(
  category: Classification["category"],
  entity: string,
): Promise<unknown> {
  const trimmed = entity.trim();
  switch (category) {
    case "token_safety":
      if (!trimmed) return { error: "No token/contract address found in the question." };
      return getTokenRisk(trimmed);
    case "wallet_check":
      if (!trimmed) return { error: "No wallet address found in the question." };
      return getWalletSummary(trimmed);
    case "sentiment": {
      const [market, news] = await Promise.all([
        trimmed ? getCoinMarketData(trimmed) : null,
        getNews(5),
      ]);
      return { market, news };
    }
    case "brief":
      if (!trimmed) return { error: "No asset found in the question." };
      return getCoinMarketData(trimmed);
    default:
      return null;
  }
}

async function synthesizeAnswer(
  question: string,
  context: FenlytDataContext,
): Promise<string> {
  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: FENLYT_SYSTEM_PROMPT },
      { role: "user", content: buildFenlytPrompt(question, context) },
    ],
    temperature: 0.3,
  });

  const answer = completion.choices[0]?.message?.content?.trim();
  if (!answer) throw new Error("The model returned an empty answer.");
  return answer;
}

/**
 * Fenlyt's core pipeline: classify the question into one of the four query
 * categories (or reject as out-of-scope), pull the relevant CoinStats data,
 * synthesize a research-brief answer with Groq, then charge the flat
 * per-query fee via the existing x402/payment settlement layer.
 */
export async function runFenlytQuery(
  question: string,
  querySessionId: string,
): Promise<FenlytQueryResult> {
  const classification = await classifyQuestion(question);

  if (classification.category === "out_of_scope") {
    return {
      success: true,
      outOfScope: true,
      category: "out_of_scope",
      entity: null,
      answer: FENLYT_OUT_OF_SCOPE_MESSAGE,
      dataUsed: null,
      amountUsd: "0.00",
      payment: null,
    };
  }

  const data = await fetchDataForCategory(classification.category, classification.entity);
  const context: FenlytDataContext = {
    category: classification.category,
    entity: classification.entity,
    data,
  };

  const answer = await synthesizeAnswer(question, context);

  // Charge the flat query fee. Reuses the existing settlement layer: a single
  // line item paid to Fenlyt's own treasury, rather than per-source payouts.
  const treasuryAddress = process.env.SCRIBE_TREASURY_WALLET ?? "";
  const payment = await executeQueryPayment({
    querySessionId,
    citations: [
      {
        sourceId: "fenlyt-query",
        payoutAddress: treasuryAddress,
        amountUsd: QUERY_FEE_USD,
      },
    ],
  });

  if (!payment.success) {
    console.error(
      `[fenlyt] payment failed for session ${querySessionId}: ${payment.error ?? "unknown error"}`,
    );
  }

  return {
    success: true,
    outOfScope: false,
    category: classification.category,
    entity: classification.entity || null,
    answer,
    dataUsed: data,
    amountUsd: QUERY_FEE_USD,
    payment: {
      status: payment.success ? "SUCCEEDED" : "FAILED",
      txHash: payment.txHash ?? null,
      isMock: payment.isMock,
    },
  };
}
