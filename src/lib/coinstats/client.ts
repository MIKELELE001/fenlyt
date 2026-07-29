// CoinStats API client — the single external data source for Fenlyt. Covers
// the four core query categories: token safety, wallet reputation, market
// sentiment, and quick asset briefs. Free tier: 20,000 requests/month.
//
// Endpoints verified against CoinStats' public docs (openapiv1.coinstats.app):
// - GET /coins            — list, sortBy/filters, NO free-text search param
// - GET /coins/{coinId}   — single coin by its lowercase id (e.g. "ethereum")
// - GET /coins?coinIds=x,y — batch lookup by id
// - GET /wallet/balance?address=&connectionId= — returns a raw array of
//   token holdings (not wrapped in an object)
// Note: CoinStats' full contract risk scanner ("Glider Token Risk") is a
// paid Degen-plan feature, not available on the free tier this project
// uses. Token safety here uses /coins?includeRiskScore=true instead — a
// lighter, coin-level signal rather than a full contract scan. The prompt
// is written to be explicit about that limitation rather than overclaim.

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
  riskScore?: number;
};

// Common symbol -> CoinStats coinId map. Covers the vast majority of real
// questions with a single cheap /coins/{id} call, avoiding the expensive
// list-scan fallback below (which was hitting the free-tier rate limit).
const SYMBOL_TO_COIN_ID: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  bnb: "binance-coin",
  xrp: "ripple",
  ada: "cardano",
  doge: "dogecoin",
  usdt: "tether",
  usdc: "usd-coin",
  matic: "matic-network",
  dot: "polkadot",
  avax: "avalanche-2",
  link: "chainlink",
  ltc: "litecoin",
  trx: "tron",
  shib: "shiba-inu",
  arb: "arbitrum",
  op: "optimism",
  atom: "cosmos",
  near: "near",
  apt: "aptos",
  sui: "sui",
};

// Short-lived in-memory cache for the top-coins fallback list, so a burst of
// queries within the same warm serverless instance doesn't re-spend credits
// on an identical list fetch. Cleared naturally on cold start.
let topCoinsCache: { data: Record<string, unknown>[]; fetchedAt: number } | null = null;
const TOP_COINS_CACHE_TTL_MS = 5 * 60 * 1000;

async function getTopCoinsList(): Promise<Record<string, unknown>[]> {
  if (topCoinsCache && Date.now() - topCoinsCache.fetchedAt < TOP_COINS_CACHE_TTL_MS) {
    return topCoinsCache.data;
  }
  const list = await coinstatsFetch<{ result: Record<string, unknown>[] }>(
    `/coins?limit=100&sortBy=rank`,
  );
  topCoinsCache = { data: list.result ?? [], fetchedAt: Date.now() };
  return topCoinsCache.data;
}

/**
 * Resolve a free-text entity (symbol like "ETH", or a name/id like
 * "ethereum") to a coin. There is no free-text search on /coins, so this:
 * 1. Checks the common-symbol map (zero extra cost beyond the id lookup)
 * 2. Tries the input directly as a coinId (covers names like "ethereum")
 * 3. Falls back to a cached top-100 list scan (only hits the API once per
 *    5-minute window, to stay well under the free-tier rate limit)
 */
export async function getCoinMarketData(
  query: string,
  { includeRiskScore = false }: { includeRiskScore?: boolean } = {},
): Promise<CoinMarketData | null> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const mappedId = SYMBOL_TO_COIN_ID[normalized];
  const idsToTry = mappedId ? [mappedId, normalized] : [normalized];

  for (const id of idsToTry) {
    try {
      const direct = await coinstatsFetch<Record<string, unknown>>(
        `/coins/${encodeURIComponent(id)}${includeRiskScore ? "?includeRiskScore=true" : ""}`,
      );
      if (direct && typeof direct.id === "string") {
        return mapCoin(direct);
      }
    } catch {
      // Not a valid coinId — try the next candidate / fall through below.
    }
  }

  // Fall back: scan a cached top-100 list and match symbol or name.
  try {
    const list = await getTopCoinsList();
    const match = list.find((c) => {
      const symbol = String(c.symbol ?? "").toLowerCase();
      const name = String(c.name ?? "").toLowerCase();
      return symbol === normalized || name === normalized;
    });
    return match ? mapCoin(match) : null;
  } catch {
    // Rate-limited or otherwise unavailable — return null rather than throw,
    // so the pipeline can report "no data found" instead of a hard failure.
    return null;
  }
}

function mapCoin(c: Record<string, unknown>): CoinMarketData {
  return {
    id: String(c.id ?? ""),
    name: String(c.name ?? ""),
    symbol: String(c.symbol ?? ""),
    price: Number(c.price ?? 0),
    priceChange1d: c.priceChange1d != null ? Number(c.priceChange1d) : undefined,
    priceChange1w: c.priceChange1w != null ? Number(c.priceChange1w) : undefined,
    marketCap: c.marketCap != null ? Number(c.marketCap) : undefined,
    volume: c.volume != null ? Number(c.volume) : undefined,
    rank: c.rank != null ? Number(c.rank) : undefined,
    riskScore: c.riskScore != null ? Number(c.riskScore) : undefined,
  };
}

export type TokenSafetyReport = {
  query: string;
  coin: CoinMarketData | null;
  note: string;
};

/**
 * Coin-level safety signal (rank, volume, market cap, riskScore if the API
 * returns one). This is NOT a full smart-contract scan — that CoinStats
 * feature is a paid add-on. The prompt is told this plainly so the answer
 * doesn't overclaim certainty.
 */
export async function getTokenSafety(query: string): Promise<TokenSafetyReport> {
  const coin = await getCoinMarketData(query, { includeRiskScore: true });
  return {
    query,
    coin,
    note: coin
      ? "Signal is based on market rank, volume, and market cap (and a risk score if provided by the API) — not a full smart-contract security scan."
      : "No matching coin was found for this query.",
  };
}

export type WalletHolding = {
  coinId: string;
  name: string;
  symbol: string;
  amount: number;
  price: number;
  valueUsd: number;
  rank?: number;
  chain?: string;
};

export type WalletSummary = {
  address: string;
  totalValueUsd: number;
  holdings: WalletHolding[];
};

/**
 * Wallet holdings summary across all EVM chains in one call (not just
 * Ethereum) — uses CoinStats' /wallet/balances endpoint. Pass a specific
 * `networks` value (e.g. "ethereum" or "ethereum,polygon") to narrow the
 * search if needed; defaults to every supported EVM chain.
 *
 * Verified response shape (confirmed via live API call, not just docs):
 * { "value": [ { "blockchain": "ethereum", "balances": [ { coinId, amount,
 *   chain, name, symbol, price, pCh24h, rank, volume, ... }, ... ] }, ... ] }
 * — i.e. one entry per chain, each with its own nested `balances` array.
 * This is NOT a flat array of holdings at the top level.
 */
export async function getWalletSummary(
  address: string,
  networks = "all",
): Promise<WalletSummary> {
  const response = await coinstatsFetch<{
    value: Array<{ blockchain: string; balances: Record<string, unknown>[] }>;
  }>(`/wallet/balances?address=${encodeURIComponent(address)}&networks=${encodeURIComponent(networks)}`);

  const holdings: WalletHolding[] = (response.value ?? []).flatMap((chainEntry) =>
    (chainEntry.balances ?? []).map((r) => {
      const amount = Number(r.amount ?? 0);
      const price = Number(r.price ?? 0);
      return {
        coinId: String(r.coinId ?? ""),
        name: String(r.name ?? ""),
        symbol: String(r.symbol ?? ""),
        amount,
        price,
        valueUsd: amount * price,
        rank: r.rank != null ? Number(r.rank) : undefined,
        chain: r.chain != null ? String(r.chain) : chainEntry.blockchain,
      };
    }),
  );

  return {
    address,
    totalValueUsd: holdings.reduce((sum, h) => sum + h.valueUsd, 0),
    holdings,
  };
}

export type NewsItem = {
  id: string;
  title: string;
  feedDate?: string;
  source?: string;
};

/** Recent general market news, used as supporting context for sentiment
 * synthesis alongside the coin's own price action. */
export async function getNews(limit = 5): Promise<NewsItem[]> {
  const data = await coinstatsFetch<{ result: NewsItem[] }>(`/news?limit=${limit}`);
  return data.result ?? [];
}
