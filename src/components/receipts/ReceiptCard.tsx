import { CheckCircle2, XCircle, Clock } from "lucide-react";
import clsx from "clsx";
import { DevModeBadge } from "@/components/shared/DevModeBadge";
import { formatUsd } from "@/lib/format/usd";
import type { ReceiptListItem, ReceiptStatus } from "@/lib/types/receipt";
import styles from "./ReceiptCard.module.css";

type StatusMeta = {
  label: string;
  icon: typeof CheckCircle2;
  tone: string | undefined;
};

function resolveStatus(status: ReceiptStatus): StatusMeta {
  switch (status) {
    case "SUCCEEDED":
      return { label: "Paid", icon: CheckCircle2, tone: styles.success };
    case "FAILED":
      return { label: "Failed", icon: XCircle, tone: styles.failed };
    default:
      return { label: "Pending", icon: Clock, tone: styles.pending };
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ReceiptCard({ receipt }: { receipt: ReceiptListItem }) {
  const status = resolveStatus(receipt.status);
  const StatusIcon = status.icon;

  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.top}>
          <span className={clsx(styles.status, status.tone)}>
            <StatusIcon size={14} aria-hidden />
            {status.label}
          </span>
          {receipt.isMock && <DevModeBadge />}
        </div>
        <p className={styles.reference}>
          {receipt.isMock ? "Mock ref" : "Tx"}: {receipt.txHash ?? "—"}
        </p>
        {receipt.status === "FAILED" && receipt.providerReference && (
          <p className={styles.reason}>{receipt.providerReference}</p>
        )}
        <p className={styles.date}>{formatDateTime(receipt.createdAt)}</p>
      </div>
      <div className={styles.amountBox}>
        <span className={styles.amount}>
          {formatUsd(receipt.totalAmountUsd)}
        </span>
        <span className={styles.amountLabel}>total paid</span>
      </div>
    </article>
  );
}
