import { randomUUID } from "node:crypto";
import {
  PAYMENT_HEADER,
  X402_ASSET,
  X402_NETWORK,
  X402_SCHEME,
  X402_VERSION,
  type X402Accept,
  type X402Challenge,
  type X402PaymentPayload,
  type SourceContentResponse,
} from "@/lib/types/payment";

// What the agent learns after unlocking a source: the content plus the payment
// terms it satisfied (used by the ask pipeline to settle + record a receipt).
export type SourceAccessResult = {
  content: string;
  title: string;
  authorName: string;
  payment: {
    sourceId: string;
    resource: string;
    amountUsd: string;
    payTo: string;
    asset: string;
    network: string;
    isMock: boolean;
  };
};

function encodePaymentProof(payload: X402PaymentPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Build the X-Payment authorization for a challenge.
 * [DEV MODE] This is a mock x402 authorization — not settled on-chain. Real
 * mode would sign a payment payload with the treasury key / hand it to an x402
 * facilitator. Either way the header and the retry code path are identical.
 */
function buildPaymentProof(accept: X402Accept): X402PaymentPayload {
  return {
    x402Version: X402_VERSION,
    scheme: X402_SCHEME,
    network: accept.network,
    resource: accept.resource,
    amountPaid: accept.maxAmountRequired,
    asset: accept.asset,
    payTo: accept.payTo,
    authorization: {
      nonce: randomUUID(),
      from: process.env.SCRIBE_TREASURY_WALLET ?? "scribe-treasury-mock",
      isMock: process.env.PAYMENT_MODE !== "real",
      issuedAt: new Date().toISOString(),
    },
  };
}

/**
 * Perform the full x402 handshake to unlock a source's content:
 *   1. GET the resource with no payment  → expect HTTP 402 + challenge
 *   2. Authorize payment for the challenge (mock proof in dev mode)
 *   3. Retry with the X-Payment header    → receive content
 */
export async function accessSourceContent(params: {
  baseUrl: string;
  sourceId: string;
}): Promise<SourceAccessResult> {
  const url = `${params.baseUrl}/api/sources/${params.sourceId}/content`;

  const challengeRes = await fetch(url, { cache: "no-store" });
  if (challengeRes.status !== 402) {
    throw new Error(
      `Expected HTTP 402 from source content, got ${challengeRes.status}.`,
    );
  }

  const challenge = (await challengeRes.json()) as X402Challenge;
  const accept = challenge.accepts[0];
  if (!accept) {
    throw new Error("x402 challenge contained no payment options.");
  }

  const proof = buildPaymentProof(accept);

  const paidRes = await fetch(url, {
    cache: "no-store",
    headers: { [PAYMENT_HEADER]: encodePaymentProof(proof) },
  });
  if (!paidRes.ok) {
    throw new Error(`Payment was rejected (status ${paidRes.status}).`);
  }

  const data = (await paidRes.json()) as SourceContentResponse;
  return {
    content: data.content,
    title: data.title,
    authorName: data.authorName,
    payment: {
      sourceId: params.sourceId,
      resource: accept.resource,
      amountUsd: accept.maxAmountRequired,
      payTo: accept.payTo,
      asset: accept.asset ?? X402_ASSET,
      network: accept.network ?? X402_NETWORK,
      isMock: proof.authorization.isMock,
    },
  };
}
