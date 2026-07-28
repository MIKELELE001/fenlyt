import { resolvePaymentMode } from "./paymentTypes";
import type {
  PaymentExecutionInput,
  PaymentExecutionResult,
} from "./paymentTypes";
import { mockExecutePayment } from "./providers/mockProvider";
import { circleArcExecutePayment } from "./providers/circleArcProvider";

/**
 * The single public entrypoint for settling a query payment. Reads
 * PAYMENT_MODE and delegates to the mock or real provider. Nothing else in the
 * app may call a provider directly.
 */
export async function executeQueryPayment(
  input: PaymentExecutionInput,
): Promise<PaymentExecutionResult> {
  if (resolvePaymentMode() === "real") {
    return circleArcExecutePayment(input);
  }
  return mockExecutePayment(input);
}
