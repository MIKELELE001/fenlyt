import {
  initiateDeveloperControlledWalletsClient,
  type CircleDeveloperControlledWalletsClient,
  type Balance,
} from "@circle-fin/developer-controlled-wallets";

// Lazily-built Circle Developer-Controlled Wallets client. Reused across calls
// within a server process. Only constructed when PAYMENT_MODE=real reaches the
// real provider, so mock mode never needs the Circle credentials.
let client: CircleDeveloperControlledWalletsClient | null = null;

export function getCircleClient(): CircleDeveloperControlledWalletsClient {
  if (client) return client;
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) {
    throw new Error(
      "CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set for real payments.",
    );
  }
  client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
  return client;
}

export function getTreasuryWalletId(): string {
  const walletId = process.env.CIRCLE_TREASURY_WALLET_ID;
  if (!walletId) {
    throw new Error("CIRCLE_TREASURY_WALLET_ID must be set for real payments.");
  }
  return walletId;
}

/**
 * Resolve the Circle token id for the treasury's USDC payout token on Arc
 * testnet. Derived from the wallet's live balances so we never hardcode a
 * contract address that could differ between Circle environments.
 *
 * Arc exposes two USDC tokens: the native one (also the gas token, 18 decimals)
 * and the standard ERC-20 (6 decimals). We pay creators in the ERC-20 USDC, so
 * prefer a non-native USDC with a positive balance; fall back to any USDC with a
 * balance, then any USDC at all.
 */
export async function resolveUsdcTokenId(walletId: string): Promise<string> {
  const res = await getCircleClient().getWalletTokenBalance({ id: walletId });
  const balances = res.data?.tokenBalances ?? [];
  const usdc = balances.filter(
    (b: Balance) => b.token.symbol?.toUpperCase() === "USDC",
  );
  if (usdc.length === 0) {
    throw new Error("Treasury wallet holds no USDC balance on Arc testnet.");
  }

  const funded = usdc.filter((b: Balance) => Number(b.amount) > 0);
  const pool = funded.length > 0 ? funded : usdc;
  const preferred = pool.find((b: Balance) => !b.token.isNative) ?? pool[0];
  if (!preferred) {
    throw new Error("Treasury wallet holds no USDC balance on Arc testnet.");
  }
  return preferred.token.id;
}
