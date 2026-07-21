import { User } from "lucide-react";
import type { SourceListItem } from "@/lib/types/source";
import { formatUsd } from "@/lib/format/usd";
import styles from "./SourceCard.module.css";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SourceCard({ source }: { source: SourceListItem }) {
  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <h3 className={styles.title}>{source.title}</h3>
        <p className={styles.author}>
          <User size={14} aria-hidden />
          {source.authorName}
        </p>
      </div>
      <div className={styles.meta}>
        <span className={styles.price}>{formatUsd(source.pricePerUseUsd)}</span>
        <span className={styles.priceLabel}>per use</span>
        <span className={styles.date}>{formatDate(source.createdAt)}</span>
      </div>
    </article>
  );
}
