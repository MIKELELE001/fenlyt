import { randomUUID } from "node:crypto";
import type {
  PaymentExecutionInput,
  PaymentExecutionResult,
} from "../paymentTypes";

/**
 * [DEV MODE — Mock Payment]
 * No Arc/Circle network call is made. Produces a receipt shape identical to a
 * real settlement (generated reference id) so the DB rows and UI treat a mock
 * payment exactly like a real one. See CLAUDE.md section 6.
 */
export function mockExecutePayment(
  input: PaymentExecutionInput,
): PaymentExecutionResult {
  const reference = randomUUID();
  return {
    success: true,
    // Mock tx hash — clearly prefixed so it is never mistaken for a chain tx.
    txHash: `mock_${reference}`,
    providerReference: `mock_${input.querySessionId}`,
    isMock: true,
  };
}
