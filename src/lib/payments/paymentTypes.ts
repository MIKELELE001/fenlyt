// Payment execution adapter types — the settlement layer. See CLAUDE.md §13.
// The rest of the app calls executeScribePayment() with this input shape and
// never touches a provider directly.

export type PaymentExecutionInput = {
  querySessionId: string;
  citations: Array<{
    sourceId: string;
    payoutAddress: string;
    amountUsd: string;
  }>;
};

export type PaymentExecutionResult = {
  success: boolean;
  txHash?: string;
  providerReference?: string;
  isMock: boolean;
  error?: string;
};

export type PaymentMode = "mock" | "real";

// PAYMENT_MODE defaults to "mock" for any value other than an explicit "real".
export function resolvePaymentMode(): PaymentMode {
  return process.env.PAYMENT_MODE === "real" ? "real" : "mock";
}
