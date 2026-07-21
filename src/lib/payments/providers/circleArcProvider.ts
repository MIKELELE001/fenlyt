import { FeeLevel } from "@circle-fin/developer-controlled-wallets";
import type {
  PaymentExecutionInput,
  PaymentExecutionResult,
} from "../paymentTypes";
import {
  getCircleClient,
  getTreasuryWalletId,
  resolveUsdcTokenId,
} from "./circleClient";

// Circle reports these states as permanently failed; anything else is in-flight.
const TERMINAL_FAIL = new Set(["FAILED", "DENIED", "CANCELLED"]);
const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 2500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll a Circle transaction until it carries an on-chain hash, fails, or the
 * budget runs out. A null return means "submitted, hash not yet visible" — the
 * receipt still records the Circle reference so the payment is traceable.
 */
async function waitForTxHash(transactionId: string): Promise<string | null> {
  const client = getCircleClient();
  for (let i = 0; i < POLL_ATTEMPTS; i += 1) {
    const res = await client.getTransaction({ id: transactionId });
    const tx = res.data?.transaction;
    if (tx?.txHash) return tx.txHash;
    if (tx && TERMINAL_FAIL.has(tx.state)) {
      throw new Error(`Circle transaction ${transactionId} ${tx.state}.`);
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return null;
}

/**
 * Real Circle/Arc settlement on Arc testnet (selected when PAYMENT_MODE=real).
 *
 * Transfers USDC from the developer-controlled treasury wallet to each
 * citation's payout address, one Circle transaction per source, then aggregates
 * them into a single settlement reference. The entity secret registered with
 * Circle authorizes each transfer — no raw private key is held here.
 */
export async function circleArcExecutePayment(
  input: PaymentExecutionInput,
): Promise<PaymentExecutionResult> {
  if (input.citations.length === 0) {
    return { success: false, isMock: false, error: "No citations to pay." };
  }
  try {
    const client = getCircleClient();
    const walletId = getTreasuryWalletId();
    const tokenId = await resolveUsdcTokenId(walletId);

    const transactionIds: string[] = [];
    for (const citation of input.citations) {
      const res = await client.createTransaction({
        walletId,
        tokenId,
        destinationAddress: citation.payoutAddress,
        amount: [citation.amountUsd],
        fee: { type: "level", config: { feeLevel: FeeLevel.Medium } },
        refId: `scribe:${input.querySessionId}:${citation.sourceId}`,
      });
      const id = res.data?.id;
      if (!id) throw new Error("Circle did not return a transaction id.");
      transactionIds.push(id);
    }

    // Best-effort on-chain hash of the first transfer for the receipt UI.
    const firstTxId = transactionIds[0];
    const txHash = firstTxId ? await waitForTxHash(firstTxId) : undefined;

    return {
      success: true,
      txHash: txHash ?? undefined,
      providerReference: transactionIds.join(","),
      isMock: false,
    };
  } catch (error) {
    return {
      success: false,
      isMock: false,
      error:
        error instanceof Error ? error.message : "Circle/Arc payment failed.",
    };
  }
}
