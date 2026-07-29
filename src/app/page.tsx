import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Pay-per-query financial research</span>
        <h1 className={styles.headline}>Affordable financial intelligence, for everyone.</h1>
        <p className={styles.sub}>
          Fenlyt answers the questions that matter before you trade — is this
          token safe, what does this wallet&apos;s history say, what&apos;s the
          market feeling right now — for cents, not a subscription.
        </p>
        <div className={styles.ctas}>
          <Link href="/ask" className={styles.ctaPrimary}>
            <Search size={16} aria-hidden />
            Ask Fenlyt
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <section className={styles.steps}>
        <div className={styles.step}>
          <span className={styles.stepNum}>1</span>
          <h3 className={styles.stepTitle}>Ask anything financial</h3>
          <p className={styles.stepText}>
            Token safety, wallet reputation, market sentiment, or a quick asset
            brief — ask in plain language.
          </p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>2</span>
          <h3 className={styles.stepTitle}>Fenlyt pays for the data</h3>
          <p className={styles.stepText}>
            The agent pulls live market data, pays the micro-fee autonomously
            over x402, and grounds the answer in real numbers — no invented
            figures.
          </p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>3</span>
          <h3 className={styles.stepTitle}>Get a research brief</h3>
          <p className={styles.stepText}>
            A clear verdict up front, backed by the data that supports it —
            institutional-grade insight at retail-friendly prices.
          </p>
        </div>
      </section>
    </div>
  );
}
