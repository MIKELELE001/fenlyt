import { Coins, Quote } from "lucide-react";
import { formatUsd } from "@/lib/format/usd";
import type { CreatorEarnings } from "@/lib/types/earnings";
import styles from "./EarningsSummary.module.css";

/**
 * Headline earnings for the signed-in creator, shown above their sources. Sums
 * every paid citation of their work. Zero state is handled inline so new
 * creators see an encouraging $0.00 rather than an empty gap.
 */
export function EarningsSummary({ earnings }: { earnings: CreatorEarnings }) {
  return (
    <section className={styles.card} aria-label="Your earnings">
      <div className={styles.metric}>
        <span className={styles.iconWrap} aria-hidden>
          <Coins size={18} />
        </span>
        <div>
          <p className={styles.value}>{formatUsd(earnings.totalEarned)}</p>
          <p className={styles.label}>Total earned</p>
        </div>
      </div>
      <div className={styles.divider} aria-hidden />
      <div className={styles.metric}>
        <span className={styles.iconWrap} aria-hidden>
          <Quote size={18} />
        </span>
        <div>
          <p className={styles.value}>{earnings.totalUses}</p>
          <p className={styles.label}>
            Paid citation{earnings.totalUses === 1 ? "" : "s"} of your work
          </p>
        </div>
      </div>
    </section>
  );
}
