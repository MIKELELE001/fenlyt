// Self-contained e2e test for Scribe /api/ask with real USDC payments.
// Run with: npx tsx scripts/e2e-test.ts
// Requires: Neon DB up, .env.local populated, PAYMENT_MODE=real
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

// Load env from .env.local into process.env for spawn inheritance
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const PORT = 3007;
const BASE_URL = `http://localhost:${PORT}`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCommand(cmd: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { shell: true, env: process.env });
    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (d) => (stdout += d.toString()));
    proc.stderr?.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

async function main() {
  console.log("=== Scribe E2E Test (Real USDC Payment) ===\n");

  // Step 1: Seed the DB
  console.log("1. Seeding DB...");
  const seedResult = await runCommand("npm", ["run", "db:seed"]);
  if (seedResult.code !== 0) {
    console.log("❌ FAIL: db:seed failed");
    console.log(seedResult.stderr);
    process.exit(1);
  }
  console.log("✅ DB seeded\n");

  // Step 2: Start dev server on explicit port
  console.log(`2. Starting dev server on port ${PORT}...`);
  const server = spawn("npm", ["run", "dev"], {
    shell: true,
    env: { ...process.env, PORT: String(PORT) },
    detached: false,
  });
  let serverReady = false;
  server.stdout?.on("data", (d) => {
    const text = d.toString();
    if (text.includes("Local:") || text.includes("Ready")) serverReady = true;
  });
  server.stderr?.on("data", (d) => {
    const text = d.toString();
    if (text.includes("Local:") || text.includes("Ready")) serverReady = true;
  });

  // Wait for server ready (max 30s)
  for (let i = 0; i < 60; i++) {
    if (serverReady) break;
    await sleep(500);
  }
  if (!serverReady) {
    console.log("❌ FAIL: dev server did not become ready in 30s");
    server.kill();
    process.exit(1);
  }
  console.log("✅ Dev server ready\n");

  // Step 3: Warm compile /api/ask
  console.log("3. Warming /api/ask route...");
  await fetch(`${BASE_URL}/api/ask`, { method: "GET" }).catch(() => {});
  await sleep(2000);

  // Step 4: POST /api/ask with a test question that should rank all 3 sources
  console.log("4. POSTing test question to /api/ask...");
  const question = "How do autonomous agents pay creators for grounded answers?";
  const askRes = await fetch(`${BASE_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!askRes.ok) {
    console.log(`❌ FAIL: /api/ask returned HTTP ${askRes.status}`);
    const text = await askRes.text();
    console.log(text);
    server.kill();
    process.exit(1);
  }

  const data = await askRes.json();
  console.log("✅ Response received\n");

  // Step 5: Verify response shape and real payment
  console.log("5. Verifying response...");
  if (!data.success) {
    console.log("❌ FAIL: success=false");
    console.log(JSON.stringify(data, null, 2));
    server.kill();
    process.exit(1);
  }

  const { receipt, answer, citations, totalPaymentUsd } = data;
  if (!receipt) {
    console.log("❌ FAIL: receipt missing");
    server.kill();
    process.exit(1);
  }

  console.log("\n=== RECEIPT ===");
  console.log(`  ID:         ${receipt.id}`);
  console.log(`  Status:     ${receipt.status}`);
  console.log(`  isMock:     ${receipt.isMock}`);
  console.log(`  txHash:     ${receipt.txHash ?? "(null)"}`);
  console.log(`  Total paid: $${totalPaymentUsd}`);
  console.log(`  Citations:  ${citations?.length ?? 0}`);
  console.log(`  Answer len: ${answer?.length ?? 0} chars\n`);

  // Assert real payment
  if (receipt.isMock !== false) {
    console.log("❌ FAIL: receipt.isMock is not false (expected real payment)");
    server.kill();
    process.exit(1);
  }
  if (receipt.status !== "SUCCEEDED") {
    console.log(`❌ FAIL: receipt.status="${receipt.status}" (expected SUCCEEDED)`);
    server.kill();
    process.exit(1);
  }
  if (!receipt.txHash || !receipt.txHash.startsWith("0x")) {
    console.log(`❌ FAIL: receipt.txHash="${receipt.txHash}" (expected 0x... hash)`);
    server.kill();
    process.exit(1);
  }

  console.log("✅ PASS: Real USDC payment settled with on-chain tx hash\n");
  console.log(`View transaction: https://sepolia.arbiscan.io/tx/${receipt.txHash}`);
  console.log("(Note: replace with Arc block explorer URL once available)\n");

  server.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Test harness error:", err);
  process.exit(1);
});
