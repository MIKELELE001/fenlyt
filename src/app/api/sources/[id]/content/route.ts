import { NextResponse } from "next/server";
import { getSourceById } from "@/lib/queries/getSourceById";
import type { SourceWithContent } from "@/lib/queries/getSourceById";
import {
  PAYMENT_HEADER,
  X402_ASSET,
  X402_NETWORK,
  X402_SCHEME,
  X402_VERSION,
  type X402Challenge,
  type X402PaymentPayload,
  type SourceContentResponse,
} from "@/lib/types/payment";

// Build the HTTP 402 challenge for a given source + resource path.
function buildChallenge(
  resource: string,
  source: SourceWithContent,
): X402Challenge {
  return {
    x402Version: X402_VERSION,
    accepts: [
      {
        scheme: X402_SCHEME,
        network: X402_NETWORK,
        maxAmountRequired: source.pricePerUseUsd,
        resource,
        description: "Pay to access this source",
        mimeType: "application/json",
        payTo: source.payoutAddress,
        maxTimeoutSeconds: 60,
        asset: X402_ASSET,
      },
    ],
  };
}

function decodePaymentProof(header: string): X402PaymentPayload | null {
  try {
    const json = Buffer.from(header, "base64").toString("utf8");
    return JSON.parse(json) as X402PaymentPayload;
  } catch {
    return null;
  }
}

// Validate a decoded proof against the resource it claims to pay for.
function isProofValid(
  proof: X402PaymentPayload,
  expected: { resource: string; amount: string },
): boolean {
  if (proof.x402Version !== X402_VERSION) return false;
  if (proof.scheme !== X402_SCHEME) return false;
  if (proof.network !== X402_NETWORK) return false;
  if (proof.asset !== X402_ASSET) return false;
  if (proof.resource !== expected.resource) return false;
  const paid = Number.parseFloat(proof.amountPaid);
  const required = Number.parseFloat(expected.amount);
  return Number.isFinite(paid) && paid >= required;
}

// GET /api/sources/[id]/content — x402-protected. See CLAUDE.md sections 5 & 9.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resource = new URL(request.url).pathname;

  const source = await getSourceById(id);
  if (!source) {
    return NextResponse.json({ error: "Source not found." }, { status: 404 });
  }

  const header = request.headers.get(PAYMENT_HEADER);

  // No payment → issue the x402 challenge.
  if (!header) {
    return NextResponse.json(buildChallenge(resource, source), { status: 402 });
  }

  // Invalid / insufficient payment → re-issue the challenge so the agent retries.
  const proof = decodePaymentProof(header);
  if (
    !proof ||
    !isProofValid(proof, { resource, amount: source.pricePerUseUsd })
  ) {
    return NextResponse.json(buildChallenge(resource, source), { status: 402 });
  }

  // Paid → unlock content.
  const body: SourceContentResponse = {
    content: source.content,
    title: source.title,
    authorName: source.authorName,
  };
  return NextResponse.json(body);
}
