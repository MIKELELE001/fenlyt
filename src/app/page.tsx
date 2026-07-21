import Link from "next/link";
import { ArrowRight, FilePlus2, Sparkles } from "lucide-react";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Citation-based micropayments</span>
        <h1 className={styles.headline}>Pay the source behind the answer.</h1>
        <p className={styles.sub}>
          Scribe helps creators, researchers, and publishers earn when AI
          answers use their work.
        </p>
        <div className={styles.ctas}>
          <Link href="/sources/new" className={styles.ctaPrimary}>
            <FilePlus2 size={16} aria-hidden />
            Register a source
          </Link>
          <Link href="/ask" className={styles.ctaSecondary}>
            <Sparkles size={16} aria-hidden />
            Ask Scribe
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <section className={styles.steps}>
        <div className={styles.step}>
          <span className={styles.stepNum}>1</span>
          <h3 className={styles.stepTitle}>Register a source</h3>
          <p className={styles.stepText}>
            Add an article, note, or memo with a price per use and a payout
            address.
          </p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>2</span>
          <h3 className={styles.stepTitle}>Agent asks and pays</h3>
          <p className={styles.stepText}>
            Scribe grounds on the most relevant sources and pays each in USDC —
            no human confirmation. No match? It still answers, and logs the
            topic as creator demand.
          </p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>3</span>
          <h3 className={styles.stepTitle}>Creator earns</h3>
          <p className={styles.stepText}>
            Every grounded answer returns a receipt showing exactly who was paid
            and how much.
          </p>
        </div>
      </section>
    </div>
  );
}
