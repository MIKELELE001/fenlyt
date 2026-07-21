// x402 wire types + protocol constants. See CLAUDE.md section 5.
// These describe what travels over the HTTP 402 boundary between the agent
// (x402Client) and the protected source-content endpoint.

export const X402_VERSION = 1 as const;
export const X402_SCHEME = "exact" as const;
export const X402_NETWORK = "arc-testnet";
export const X402_ASSET = "USDC";
export const PAYMENT_HEADER = "X-Payment";

// A single accepted payment option inside a 402 challenge.
export type X402Accept = {
  scheme: typeof X402_SCHEME;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
};

// The body returned with an HTTP 402 response.
export type X402Challenge = {
  x402Version: typeof X402_VERSION;
  accepts: X402Accept[];
};

// Decoded contents of the X-Payment header the agent sends to unlock content.
// In mock mode the authorization is not settled on-chain; in real mode this is
// where a signed payment payload / facilitator proof would live.
export type X402PaymentPayload = {
  x402Version: typeof X402_VERSION;
  scheme: typeof X402_SCHEME;
  network: string;
  resource: string;
  amountPaid: string;
  asset: string;
  payTo: string;
  authorization: {
    nonce: string;
    from: string;
    isMock: boolean;
    issuedAt: string;
  };
};

// Body returned once payment is accepted.
export type SourceContentResponse = {
  content: string;
  title: string;
  authorName: string;
};
