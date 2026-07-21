import { User } from "lucide-react";
import { formatUsd } from "@/lib/format/usd";
import type { AskCitation } from "@/lib/types/query";
import styles from "./CitationList.module.css";

/**
 * The sources the agent cited and paid for, in citation order so the numbers
 * line up with the [Source N] markers in the answer.
 */
export function CitationList({ citations }: { citations: AskCitation[] }) {
  if (citations.length === 0) return null;

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Cited sources</h3>
      <ol className={styles.list}>
        {citations.map((citation, index) => (
          <li key={citation.sourceId} className={styles.item}>
            <span className={styles.index} aria-hidden>
              {index + 1}
            </span>
            <div className={styles.body}>
              <p className={styles.title}>{citation.title}</p>
              <p className={styles.author}>
                <User size={13} aria-hidden />
                {citation.authorName}
              </p>
            </div>
            <div className={styles.meta}>
              <span className={styles.price}>
                {formatUsd(citation.pricePerUseUsd)}
              </span>
              <span className={styles.priceLabel}>paid</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
