// CoinStats API client — the single external data source for Fenlyt. Covers
// the four core query categories: token safety, wallet reputation, market
// sentiment, and quick asset briefs. Free tier: 20,000 requests/month.

const COINSTATS_BASE_URL = "https://openapiv1.coinstats.app";

function getApiKey(): string {
  const key = process.env.COINSTATS_API_KEY;
  if (!key) {
    throw new Error("COINSTATS_API_KEY is not set.");
  }
  return key;
}

async function coinstatsFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${COINSTATS_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
      "X-API-KEY": getApiKey(),
    },
    // CoinStats data changes fast; avoid stale Next.js fetch caching.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `CoinStats request failed (${res.status}) for ${path}: ${await res.text().catch(() => "")}`,
    );
  }

  return res.json() as Promise<T>;
}

export type CoinMarketData = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange1d?: number;
  priceChange1w?: number;
  marketCap?: number;
  volume?: number;
  rank?: number;
};

/** Market data + price action for a coin by symbol or CoinStats id. Used for
 * market-sentiment and quick-brief queries. */
export async function getCoinMarketData(query: string): Promise<CoinMarketData | null> {
  const data = await coinstatsFetch<{ result: CoinMarketData[] }>(
    `/coins?search=${encodeURIComponent(query)}&limit=1`,
  );
  return data.result?.[0] ?? null;
}

export type TokenRiskReport = {
  address: string;
  isScam?: boolean;
  riskLevel?: string;
  flags?: string[];
  raw?: unknown;
};

/** Token safety / risk check by contract address. Used for the "is this token
 * safe" query category. */
export async function getTokenRisk(
  address: string,
  chain = "ethereum",
): Promise<TokenRiskReport> {
  const data = await coinstatsFetch<Record<string, unknown>>(
    `/wallet/tokenRisk?address=${encodeURIComponent(address)}&connectionId=${encodeURIComponent(chain)}`,
  );
  return {
    address,
    isScam: data.isScam as boolean | undefined,
    riskLevel: data.riskLevel as string | undefined,
    flags: data.flags as string[] | undefined,
    raw: data,
  };
}

export type WalletSummary = {
  address: string;
  totalValueUsd?: number;
  holdings?: Array<{ symbol: string; amount: number; valueUsd?: number }>;
  raw?: unknown;
};

/** Wallet holdings/history summary. Used for the wallet-reputation query
 * category. */
export async function getWalletSummary(
  address: string,
  networks = "ethereum",
): Promise<WalletSummary> {
  const data = await coinstatsFetch<Record<string, unknown>>(
    `/wallet/balance?address=${encodeURIComponent(address)}&networks=${encodeURIComponent(networks)}`,
  );
  return {
    address,
    totalValueUsd: data.totalValueUsd as number | undefined,
    holdings: data.balances as WalletSummary["holdings"],
    raw: data,
  };
}

export type NewsItem = {
  id: string;
  title: string;
  feedDate?: string;
  source?: string;
};

/** Recent news for sentiment synthesis. */
export async function getNews(limit = 5): Promise<NewsItem[]> {
  const data = await coinstatsFetch<{ result: NewsItem[] }>(
    `/news?limit=${limit}`,
  );
  return data.result ?? [];
}
