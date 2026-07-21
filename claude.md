# CLAUDE.md — Scribe Build Specification
# Lepton Agents Hackathon | Jun 15–29 2026

---

## 1. WHAT WE ARE BUILDING

**Scribe** is a citation-based micropayment layer that pays creators, researchers, and publishers when AI answers use their work as grounding material.

A creator registers a source (article, note, memo). A user asks a question. The Scribe agent autonomously retrieves relevant sources, pays for them in USDC via Arc, generates a grounded answer, and returns the answer with a payment receipt — no human payment confirmation required. The agent decides, pays, and acts.

**Hackathon fit:** RFB 06 (Creator & Publisher Monetization), secondary RFB 01 (Autonomous Paying Agents).

**Deadline:** June 29, 2026. Prioritize a working demo over extra features. Ask before deviating from this spec.

---

## 2. TECH STACK (LOCKED)

| Layer | Choice |
|---|---|
| Framework | Next.js 15+ App Router |
| Language | TypeScript — zero `any` |
| Styling | CSS Modules only |
| Forms | react-hook-form + zod + @hookform/resolvers |
| UI utilities | clsx, lucide-react |
| AI / LLM | Groq SDK (`groq-sdk`) — model: `llama-3.3-70b-versatile` |
| Database | Prisma ORM + PostgreSQL (Neon/Supabase on Vercel) / SQLite for local dev |
| Payments | Circle/Arc — USDC micropayments on Arc testnet via Circle Agent Stack |
| Payment protocol | x402 (HTTP 402 Payment Required) for source access |
| Deployment | Vercel |
| Version control | GitHub (MIKELELE001) |

---

## 3. BUILD RULES (NON-NEGOTIABLE)

- TypeScript only. Zero `any` types anywhere.
- Max 150 lines per component or file. Split into helpers/hooks/modules when approaching the limit.
- CSS Modules only. No inline styles. No Tailwind. No global utility classes.
- Server-side API keys only. Never expose secrets to the client. No `NEXT_PUBLIC_` prefix on secrets.
- Real loading, error, and empty states on every interactive component. No silent failures.
- One feature at a time. Modular, not monolithic.
- If you encounter ambiguity or an edge case not covered here, stop and ask before writing code.

---

## 4. THE AGENTIC LOOP (CRITICAL)

This is what separates Scribe from a payment demo. The agent is autonomous — it does not wait for a human to click "confirm payment."

**Flow:**
1. User submits a question on `/ask`
2. Agent backend autonomously:
   - Loads all registered sources
   - Ranks by keyword relevance, selects top 3
   - Requests each source via an x402-protected internal endpoint
   - Pays the micropayment per source access (Arc testnet USDC)
   - Generates a grounded answer using unlocked source content via Groq
   - Logs citations and payment receipt to DB
3. UI returns:
   - Grounded answer
   - Cited sources with author + price paid
   - Payment receipt (tx hash or mock reference)
   - Total paid

**No human "Confirm Payment" button.** The agent pays. The user sees the result and the receipt.

---

## 5. X402 PAYMENT FLOW

Sources are served via an x402-protected internal API route. The agent pays to unlock source content before using it in an answer.

**Route:** `GET /api/sources/[id]/content`

- If `X-Payment` header is missing → return HTTP 402 with payment details
- If `X-Payment` header is present and valid → return source content
- The agent (backend `/api/ask`) handles the 402 response, executes the micropayment, retries with the payment header

**x402 response shape (402):**
```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "arc-testnet",
    "maxAmountRequired": "0.01",
    "resource": "/api/sources/[id]/content",
    "description": "Pay to access this source",
    "mimeType": "application/json",
    "payTo": "[source.payoutAddress]",
    "maxTimeoutSeconds": 60,
    "asset": "USDC"
  }]
}
```

If real x402 infrastructure is not available at build time, implement a mock x402 handshake that follows the same code path and can be swapped for real execution later. The architecture must always respect the x402 boundary.

---

## 6. ENVIRONMENT VARIABLES

All variables are server-side only unless prefixed `NEXT_PUBLIC_`.

```bash
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=

# AI
GROQ_API_KEY=

# Payments
PAYMENT_MODE=mock                  # "mock" | "real"
CIRCLE_API_KEY=
CIRCLE_BASE_URL=https://api-sandbox.circle.com   # sandbox for dev
ARC_RPC_URL=
ARC_CHAIN_ID=
SCRIBE_TREASURY_WALLET=
SCRIBE_TREASURY_PRIVATE_KEY=
```

**Dev mock behavior:**
- When `PAYMENT_MODE=mock`, the payment adapter skips real Arc/Circle calls
- Returns a mock receipt with generated UUID, timestamp, and status `"mock_success"`
- Mock receipt is written to DB exactly as a real receipt would be
- A `[DEV MODE — Mock Payment]` badge is shown in the UI wherever payment info is displayed
- Code comments must mark all mock paths clearly

---

## 7. FOLDER STRUCTURE

```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    sources/
      page.tsx
      SourcesPage.module.css
      new/
        page.tsx
        NewSourcePage.module.css
    ask/
      page.tsx
      AskPage.module.css
    receipts/
      page.tsx
      ReceiptsPage.module.css
    api/
      sources/
        route.ts                   # GET list + POST create
        [id]/
          content/
            route.ts               # x402-protected source content endpoint
      ask/
        route.ts                   # POST — agentic ask pipeline
      receipts/
        route.ts                   # GET list

  components/
    layout/
      AppShell.tsx
      AppShell.module.css
      Header.tsx
      Header.module.css
    sources/
      SourceForm.tsx
      SourceForm.module.css
      SourceList.tsx
      SourceList.module.css
      SourceCard.tsx
      SourceCard.module.css
    ask/
      AskForm.tsx
      AskForm.module.css
      AnswerCard.tsx
      AnswerCard.module.css
      CitationList.tsx
      CitationList.module.css
      ReceiptSummary.tsx
      ReceiptSummary.module.css
    receipts/
      ReceiptList.tsx
      ReceiptList.module.css
      ReceiptCard.tsx
      ReceiptCard.module.css
    shared/
      Button.tsx + Button.module.css
      Input.tsx + Input.module.css
      TextArea.tsx + TextArea.module.css
      EmptyState.tsx + EmptyState.module.css
      LoadingState.tsx + LoadingState.module.css
      ErrorState.tsx + ErrorState.module.css
      DevModeBadge.tsx + DevModeBadge.module.css

  lib/
    db/
      prisma.ts                    # Prisma client singleton
    validation/
      source.ts
      ask.ts
    retrieval/
      tokenize.ts
      scoreSources.ts
      rankSources.ts
    ai/
      buildAnswerPrompt.ts
      generateGroundedAnswer.ts    # Groq SDK call
    payments/
      paymentTypes.ts
      executeScribePayment.ts      # Public entrypoint — reads PAYMENT_MODE
      x402Client.ts                # Handles 402 handshake + retry logic
      providers/
        mockProvider.ts
        circleArcProvider.ts
    queries/
      createSource.ts
      listSources.ts
      getSourceById.ts
      createQuerySession.ts
      attachCitations.ts
      markSessionComplete.ts
      createReceipt.ts
      listReceipts.ts
    types/
      api.ts
      source.ts
      query.ts
      payment.ts

  prisma/
    schema.prisma
    seed.ts
```

---

## 8. DATA MODEL

```prisma
model Source {
  id             String    @id @default(cuid())
  title          String
  authorName     String
  sourceType     SourceType @default(TEXT)
  sourceUrl      String?
  content        String
  payoutAddress  String
  pricePerUseUsd Decimal
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  citations      Citation[]
}

model QuerySession {
  id              String              @id @default(cuid())
  question        String
  answer          String
  status          QuerySessionStatus  @default(GENERATED)
  totalPaymentUsd Decimal
  createdAt       DateTime            @default(now())
  citations       Citation[]
  receipts        PaymentReceipt[]
}

model Citation {
  id             String       @id @default(cuid())
  querySessionId String
  sourceId       String
  relevanceScore Float
  excerptUsed    String?
  querySession   QuerySession @relation(fields: [querySessionId], references: [id])
  source         Source       @relation(fields: [sourceId], references: [id])
}

model PaymentReceipt {
  id                String         @id @default(cuid())
  querySessionId    String
  totalAmountUsd    Decimal
  status            PaymentStatus  @default(PENDING)
  txHash            String?
  providerReference String?
  isMock            Boolean        @default(false)
  createdAt         DateTime       @default(now())
  querySession      QuerySession   @relation(fields: [querySessionId], references: [id])
}

enum SourceType {
  TEXT
}

enum QuerySessionStatus {
  GENERATED
  PAID
  FAILED
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
}
```

---

## 9. API CONTRACTS

### POST /api/sources
```typescript
// Request
type CreateSourceRequest = {
  title: string;
  authorName: string;
  sourceType: "TEXT";
  sourceUrl?: string;
  content: string;
  payoutAddress: string;
  pricePerUseUsd: string;
};

// Response
type CreateSourceResponse =
  | { success: true; sourceId: string }
  | { success: false; error: string };
```

### GET /api/sources
```typescript
type ListSourcesResponse = {
  sources: Array<{
    id: string;
    title: string;
    authorName: string;
    pricePerUseUsd: string;
    createdAt: string;
  }>;
};
```

### GET /api/sources/[id]/content (x402-protected)
- No payment header → 402 with payment details
- Valid payment header → `{ content: string; title: string; authorName: string }`

### POST /api/ask
```typescript
// Request
type AskRequest = { question: string };

// Response
type AskResponse =
  | {
      success: true;
      querySessionId: string;
      answer: string;
      citations: Array<{
        sourceId: string;
        title: string;
        authorName: string;
        pricePerUseUsd: string;
        relevanceScore: number;
      }>;
      totalPaymentUsd: string;
      receipt: {
        id: string;
        txHash: string | null;
        status: string;
        isMock: boolean;
      };
    }
  | { success: false; error: string; empty?: boolean };
```

### GET /api/receipts
```typescript
type ListReceiptsResponse = {
  receipts: Array<{
    id: string;
    querySessionId: string;
    totalAmountUsd: string;
    status: "PENDING" | "SUCCEEDED" | "FAILED";
    txHash: string | null;
    isMock: boolean;
    createdAt: string;
  }>;
};
```

---

## 10. ASK PIPELINE (BACKEND — /api/ask)

Build in this exact order:

1. Validate request body (`lib/validation/ask.ts`)
2. Fetch all sources from DB
3. Rank sources by keyword relevance (`lib/retrieval/rankSources.ts`) — top 3
4. If top score is 0 → return `{ success: false, empty: true, error: "No relevant sources found." }`
5. For each top source:
   - Request `GET /api/sources/[id]/content`
   - Handle 402 → execute micropayment via `lib/payments/x402Client.ts` → retry with payment header
   - Unlock and receive source content
6. Build answer prompt (`lib/ai/buildAnswerPrompt.ts`) with question + unlocked source content
7. Call Groq (`lib/ai/generateGroundedAnswer.ts`) — model: `llama-3.3-70b-versatile`
8. Store `QuerySession` with question + answer
9. Store `Citation` rows for each source used
10. Store `PaymentReceipt` (real or mock)
11. Mark session as `PAID`
12. Return answer + citations + receipt

---

## 11. RETRIEVAL SCORING

```typescript
type RankedSource = {
  source: Source;
  score: number;
  matchedTerms: string[];
};

// Scoring rules
// - Tokenize question into lowercase terms
// - Title keyword match: weight 3
// - Content keyword match: weight 1
// - Sort descending
// - Take top 3
// - If top score === 0, return empty
```

---

## 12. GROQ ANSWER GENERATION

Model: `llama-3.3-70b-versatile`

System prompt (required, do not alter):
```
You are Scribe, a citation-grounded AI assistant. Answer questions using ONLY the source material provided below. Do not use outside knowledge. If the provided sources are insufficient to answer the question, say so clearly. Reference sources inline as [Source 1], [Source 2], etc.
```

Pass source content as user-turn context blocks, not as part of the system prompt.

---

## 13. PAYMENT ADAPTER

```typescript
// lib/payments/paymentTypes.ts
type PaymentExecutionInput = {
  querySessionId: string;
  citations: Array<{
    sourceId: string;
    payoutAddress: string;
    amountUsd: string;
  }>;
};

type PaymentExecutionResult = {
  success: boolean;
  txHash?: string;
  providerReference?: string;
  isMock: boolean;
  error?: string;
};
```

`executeScribePayment.ts` reads `PAYMENT_MODE` and delegates:
- `"mock"` → `mockProvider.ts` (returns mock result, no Arc call)
- `"real"` → `circleArcProvider.ts` (calls Circle/Arc testnet)

The rest of the app never touches payment provider logic directly — only calls `executeScribePayment`.

---

## 14. VALIDATION SCHEMAS

```typescript
// lib/validation/source.ts
const sourceSchema = z.object({
  title: z.string().min(3),
  authorName: z.string().min(2),
  sourceType: z.literal("TEXT"),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  content: z.string().min(100),
  payoutAddress: z.string().min(5),
  pricePerUseUsd: z.string().refine(v => parseFloat(v) > 0),
});

// lib/validation/ask.ts
const askSchema = z.object({
  question: z.string().min(5),
});
```

---

## 15. UI REQUIREMENTS

Every interactive view requires:
- **Loading state** — source form submit, ask request, receipts fetch, sources fetch
- **Error state** — human-readable message, never raw error object
- **Empty state** — no sources registered, no matching sources, no receipts yet

**Visual direction:**

Reference images are in `/design-refs/` in the project root. Study them before writing any UI code.

- **Background:** `#F8F9FA` (light gray page), `#FFFFFF` (card/panel)
- **Text primary:** `#111827` (near black)
- **Text secondary:** `#6B7280` (muted gray)
- **Borders:** `1px solid #E5E7EB`
- **Accent / CTA:** `#111827` (black buttons — not colored)
- **Success:** `#16A34A`
- **Error:** `#DC2626`
- **Fonts:** Inter (body + headings) — clean, modern, legible
- **Layout:** Left sidebar nav + main content area + optional right panel
- **Cards:** White background, subtle border, `border-radius: 12px`, generous padding
- **Spacing:** Generous — let content breathe
- **Typography scale:** Bold large numbers for payment amounts (like payment dashboard refs), standard weight for body
- **CTA buttons:** Black fill (`#111827`), white text, `border-radius: 8px` — no color
- **Status badges:** Small pill — green for success, red for failed, gray for pending
- **`[DEV MODE — Mock Payment]`** badge: small amber/yellow pill, shown on all payment UI when `PAYMENT_MODE=mock`
- No gradients, no heavy shadows, no decorative elements — clean and editorial

---

## 16. PAGES

### `/` (Landing)
- Headline: **"Pay the source behind the answer."**
- Sub: "Scribe helps creators, researchers, and publishers earn when AI answers use their work."
- 3-step explanation: Register a source → Agent asks and pays → Creator earns
- CTAs: "Register a source" → `/sources/new` and "Ask Scribe" → `/ask`

### `/sources`
- List sources (reverse chronological)
- Show title, author, price per use
- Empty state + "Add source" CTA

### `/sources/new`
- Source registration form
- Fields: title, authorName, sourceUrl (optional), content, payoutAddress, pricePerUseUsd

### `/ask`
- Question input form
- On submit: agent runs full pipeline (rank → pay → generate)
- Show: answer, citations, receipt summary (tx hash or mock reference, total paid, dev badge if mock)
- Loading state during entire agent pipeline

### `/receipts`
- List receipts (most recent first)
- Show: status, total amount, tx hash / mock reference, timestamp, dev badge if mock

---

## 17. BUILD ORDER

**Phase 1 — Scaffold**
Next.js 15 app, Prisma setup, base layout, shared UI components, AppShell, Header

**Phase 2 — Source Registration**
Prisma source model → validation → `/api/sources` routes → `/sources` page → `/sources/new` form

**Phase 3 — x402 Source Content Endpoint**
`/api/sources/[id]/content` with 402 gate → `x402Client.ts` handshake → payment adapter mock first

**Phase 4 — Ask Pipeline**
Retrieval helpers → `generateGroundedAnswer.ts` (Groq) → `/api/ask` route → `/ask` page UI → citations + receipt display

**Phase 5 — Receipts**
PaymentReceipt DB queries → `/api/receipts` → `/receipts` page

**Phase 6 — Polish**
Landing page, seed data (2–3 example sources), all loading/error/empty states, README, Vercel deploy

---

## 18. SEED DATA

Include `prisma/seed.ts` with 2–3 example sources:
- A short AI research note
- A creator essay excerpt
- A market analysis excerpt

Seed payout addresses can be placeholder testnet wallet strings for local dev.

---

## 19. README REQUIREMENTS

Sections:
1. What Scribe is
2. Why it exists (the payment floor problem)
3. How it works (3 steps: register, agent asks + pays, creator earns)
4. Tech stack
5. Local setup (clone → install → env vars → prisma migrate → seed → dev server)
6. Env var reference
7. Demo walkthrough (add source → ask question → see agent receipt → view receipts)
8. Hackathon fit (RFB 06, agentic payment loop, x402)
9. Dev mock mode note

---

## 20. ACCEPTANCE CRITERIA

The build is complete when:

- [ ] Creator can register a source and it persists in DB
- [ ] Sources page lists registered sources
- [ ] User can ask a question
- [ ] Agent autonomously ranks sources, pays via x402 (mock or real), generates grounded answer
- [ ] Answer displays cited sources with price paid per source
- [ ] Payment receipt is created and displayed (with dev badge if mock)
- [ ] Receipts page lists all historical receipts
- [ ] All pages have loading, error, and empty states
- [ ] No secrets exposed client-side
- [ ] No broken navigation
- [ ] App deploys cleanly to Vercel
- [ ] README covers setup and demo flow

---

## 21. OUT OF SCOPE (DO NOT BUILD)

- User authentication
- PDF upload / OCR
- Public internet crawling
- Vector DB
- Multi-recipient payment splits
- Subscription billing
- Wallet connection UI (frontend)
- Moderation pipeline
- Any feature not listed in this spec

If in doubt, don't build it. Ask first.

---

*End of spec. Build Scribe exactly as described. One phase at a time. Prioritize a working demo over completeness.*

---

## 22. ADDENDUM — Hybrid answers + Creator Demand board (approved extension, post-deploy)

Approved by the project owner after the initial spec shipped. Extends — does not
replace — the grounded-only behavior above.

**Hybrid, grounded-first answering.** The ask pipeline tries registered sources
first. If a relevant source matches, the original flow is unchanged: rank → x402
pay → grounded answer (locked `SCRIBE_SYSTEM_PROMPT`) → citations + receipt
(`sourced: true`). If **no** source is relevant, instead of returning the empty
state the agent answers from general knowledge via a **separate** prompt
(`lib/ai/generateGeneralAnswer.ts`), pays no one, and writes **no receipt**
(`sourced: false`). The locked grounded prompt and the pay flow are untouched;
answers are binary (grounded **or** general), never mixed.

- `AskResponse` success gains `sourced: boolean` and `receipt: AskReceipt | null`.
- Unsourced sessions persist as `QuerySessionStatus.UNSOURCED`, `totalPaymentUsd "0.00"`.

**Creator Demand board (`/demand`).** Every unsourced question is logged via the
new `DemandSignal` model (deduped on a normalized question, with a running
`count`). The `/demand` page lists topics most-requested-first so creators can
register content and earn next time. Files mirror the receipts pattern:
`queries/createOrBumpDemandSignal.ts`, `queries/listDemandSignals.ts`,
`types/demand.ts`, `api/demand/route.ts`, `app/demand/`, `components/demand/`.
