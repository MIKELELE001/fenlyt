# Fenlyt

**Affordable financial intelligence for underserved markets.**

Fenlyt is a pay-per-query AI financial research agent. Ask it about token safety, wallet reputation, market sentiment, or a quick asset brief — it classifies the question, pulls live market data, synthesizes a research brief with an LLM, and settles a small autonomous micropayment for the query — no subscription, no human payment confirmation.

---

## 1. Why it exists

Institutional-grade financial research tools are priced for institutions. Retail traders, especially in underserved and emerging markets, are left checking token safety and wallet history by hand or trusting whatever shows up on their timeline. Fenlyt makes that same class of research available for cents per question instead of a monthly subscription.

## 2. How it works

1. **Ask a question** — plain language: *"Is this token safe?"*, *"What's this wallet's history?"*, *"What's the sentiment on ETH?"*, *"Give me a brief on SOL."*
2. **Fenlyt classifies it** — an LLM routes the question into one of four research categories (or politely declines if it's outside financial research).
3. **Live data is pulled** — token risk, wallet holdings, market data, or news, sourced from CoinStats.
4. **The agent pays and answers** — Fenlyt settles the query fee autonomously over the [x402](https://www.x402.org/) payment protocol on Arc, then returns a research brief grounded in the data it just paid for.
5. **Every settlement is logged** — view past queries and their payment status on `/receipts`.

## 3. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules |
| Forms | react-hook-form + zod |
| AI / LLM | Groq SDK — `llama-3.3-70b-versatile` |
| Market data | CoinStats API |
| Database | Prisma ORM + PostgreSQL (Neon) |
| Payments | Self-custodied wallet — USDC on Arc testnet |
| Payment protocol | x402 (HTTP 402 Payment Required) |
| Deployment | Vercel |

## 4. Local setup

```bash
# 1. Clone
git clone https://github.com/MIKELELE001/fenlyt.git
cd fenlyt

# 2. Install
npm install

# 3. Environment variables
cp .env.example .env.local
cp .env.example .env
#    Point DATABASE_URL / DIRECT_URL at a PostgreSQL database (a free Neon
#    project works well), add GROQ_API_KEY and COINSTATS_API_KEY, and keep
#    PAYMENT_MODE=mock for local dev. See section 5 for all variables.

# 4. Create the database schema
npm run db:push

# 5. Run the dev server
npm run dev
# → http://localhost:3000
```

## 5. Environment variable reference

```bash
# Database (PostgreSQL — Neon)
DATABASE_URL=                       # pooled connection string (runtime)
DIRECT_URL=                         # direct connection (prisma db push)

# AI
GROQ_API_KEY=                       # required — server-side only

# Market data
COINSTATS_API_KEY=                  # required — server-side only

# Auth (currently unused — the demo runs with no login wall)
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_URL=http://localhost:3000

# Payments
PAYMENT_MODE=mock                   # "mock" | "real"
ARC_RPC_URL=
ARC_CHAIN_ID=
SCRIBE_TREASURY_WALLET=             # Fenlyt's treasury wallet address
SCRIBE_TREASURY_PRIVATE_KEY=        # Fenlyt's treasury wallet private key
```

## 6. Demo walkthrough

1. Go to `/ask`.
2. Ask something Fenlyt is built for, e.g. *"Is this token safe? 0x..."* or *"What's the sentiment on ETH?"*
3. Fenlyt classifies the question, pulls the relevant CoinStats data, pays the query fee, and returns a research brief — a lead verdict card plus supporting data cards.
4. Ask something off-topic, e.g. *"What's the capital of France?"* — Fenlyt declines and redirects back to financial research, staying scoped to what it's built for.
5. View `/receipts` for a log of every query and its settlement status.

## 7. Dev mock mode

With `PAYMENT_MODE=mock` (the default for local dev), the payment adapter skips real Arc calls and returns a mock receipt with a generated reference and `mock_*` tx hash, written to the database exactly as a real receipt would be — only the `isMock` flag differs. Switch to `PAYMENT_MODE=real` to route settlement through the live Arc provider.
