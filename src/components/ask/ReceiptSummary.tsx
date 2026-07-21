import { CheckCircle2, XCircle, Clock } from "lucide-react";
import clsx from "clsx";
import { DevModeBadge } from "@/components/shared/DevModeBadge";
import { formatUsd } from "@/lib/format/usd";
import type { AskReceipt } from "@/lib/types/query";
import styles from "./ReceiptSummary.module.css";

type StatusMeta = {
  label: string;
  icon: typeof CheckCircle2;
  tone: string | undefined;
};

// Map a receipt status to its label, icon and tone. Unknown values fall back to
// the neutral "pending" treatment.
function resolveStatus(status: string): StatusMeta {
  switch (status) {
    case "SUCCEEDED":
      return { label: "Paid", icon: CheckCircle2, tone: styles.success };
    case "FAILED":
      return { label: "Failed", icon: XCircle, tone: styles.failed };
    default:
      return { label: "Pending", icon: Clock, tone: styles.pending };
  }
}

type ReceiptSummaryProps = {
  receipt: AskReceipt;
  totalPaymentUsd: string;
};

/**
 * The payment receipt the agent produced — total paid, on-chain (or mock) tx
 * reference, and the dev badge whenever the settlement was mocked.
 */
export function ReceiptSummary({ receipt, totalPaymentUsd }: ReceiptSummaryProps) {
  const status = resolveStatus(receipt.status);
  const StatusIcon = status.icon;

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h3 className={styles.heading}>Payment receipt</h3>
        {receipt.isMock && <DevModeBadge />}
      </div>

      <div className={styles.amountRow}>
        <span className={styles.amount}>{formatUsd(totalPaymentUsd)}</span>
        <span className={clsx(styles.status, status.tone)}>
          <StatusIcon size={14} aria-hidden />
          {status.label}
        </span>
      </div>

      <dl className={styles.details}>
        <div className={styles.detail}>
          <dt className={styles.term}>
            {receipt.isMock ? "Mock reference" : "Tx hash"}
          </dt>
          <dd className={styles.value}>{receipt.txHash ?? "—"}</dd>
        </div>
        <div className={styles.detail}>
          <dt className={styles.term}>Receipt ID</dt>
          <dd className={styles.value}>{receipt.id}</dd>
        </div>
      </dl>
    </section>
  );
}
