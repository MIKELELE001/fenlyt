import { TrendingUp, PlusCircle } from "lucide-react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import type { DemandSignalItem } from "@/lib/types/demand";
import styles from "./DemandCard.module.css";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DemandCard({ signal }: { signal: DemandSignalItem }) {
  const askLabel = signal.count === 1 ? "asked once" : `asked ${signal.count} times`;

  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.top}>
          <span className={styles.count}>
            <TrendingUp size={14} aria-hidden />
            {askLabel}
          </span>
          <span className={styles.date}>last {formatDateTime(signal.lastAskedAt)}</span>
        </div>
        <p className={styles.question}>{signal.question}</p>
      </div>
      <div className={styles.action}>
        <ButtonLink
          href="/sources/new"
          variant="secondary"
          size="sm"
          leftIcon={<PlusCircle size={15} />}
        >
          Register a source
        </ButtonLink>
      </div>
    </article>
  );
}
