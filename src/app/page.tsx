import Link from "next/link";
import { ArrowRight, Search, Zap, Shield, Radio } from "lucide-react";
import styles from "./page.module.css";

const SAMPLE_QUESTION = "What's the sentiment on ETH?";
const SAMPLE_VERDICT =
  "ETH sentiment is mildly positive in the short term but negative over the week, inferred from price action.";
const SAMPLE_POINTS = [
  "Price is up 0.46% in the last 24h, indicating a slight upward trend.",
  "Price is down 2.29% over the past week, suggesting a longer-term pullback.",
  "Market cap sits at $228B with $17.7B in 24h volume — a liquid, actively traded asset.",
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Pay-per-query financial research</span>
        <h1 className={styles.headline}>Affordable financial intelligence, for everyone.</h1>
        <p className={styles.hook}>
          Fenlyt turns financial research into an API you can pay for one
          question at a time.
        </p>
        <p className={styles.sub}>
          Is this token safe? What does this wallet&apos;s history say?
          What&apos;s the market feeling right now? Fenlyt answers — grounded
          in live data, for cents, not a subscription.
        </p>
        <div className={styles.ctas}>
          <Link href="/ask" className={styles.ctaPrimary}>
            <Search size={16} aria-hidden />
            Ask Fenlyt
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <section className={styles.sampleSection}>
        <p className={styles.sampleLabel}>See it in action</p>
        <div className={styles.sampleCard}>
          <p className={styles.sampleQuestion}>&ldquo;{SAMPLE_QUESTION}&rdquo;</p>
          <div className={styles.sampleHero}>
            <span className={styles.sampleBadge}>
              <Radio size={12} aria-hidden />
              MARKET SENTIMENT
            </span>
            <p className={styles.sampleVerdict}>{SAMPLE_VERDICT}</p>
          </div>
          <div className={styles.samplePoints}>
            {SAMPLE_POINTS.map((point, i) => (
              <div key={i} className={styles.samplePoint}>
                {point}
              </div>
            ))}
          </div>
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
            The agent pulls live market data, settles the micro-fee
            autonomously over x402, and grounds the answer in real numbers —
            no invented figures.
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

      <section className={styles.whySection}>
        <h2 className={styles.sectionTitle}>Why Fenlyt, not a chatbot</h2>
        <p className={styles.whyText}>
          Fenlyt isn&apos;t a chatbot with a finance skin. It&apos;s a
          financial research endpoint that guarantees every answer is
          grounded in live, structured market data — and settled
          autonomously as a pay-per-query service, not a subscription you
          forget you&apos;re paying for.
        </p>
      </section>

      <section className={styles.whyNowSection}>
        <h2 className={styles.sectionTitle}>Why now</h2>
        <p className={styles.whyText}>
          Financial intelligence is increasingly consumed by AI agents and
          applications rather than directly by humans. Subscription models
          create friction for occasional users, while autonomous
          micropayments make high-quality research economically accessible
          one query at a time. Fenlyt demonstrates that future.
        </p>
      </section>

      <section className={styles.architectureSection}>
        <h2 className={styles.sectionTitle}>How settlement works</h2>
        <p className={styles.whyText}>
          Fenlyt&apos;s treasury settles each query autonomously, standing in
          for what would be a user-linked spending account in production —
          demonstrating x402 settlement on Arc without interrupting the
          research experience with per-question approval friction.
        </p>
        <div className={styles.trustStrip}>
          <span className={styles.trustBadge}>
            <Zap size={14} aria-hidden /> Groq
          </span>
          <span className={styles.trustBadge}>
            <Shield size={14} aria-hidden /> CoinStats
          </span>
          <span className={styles.trustBadge}>
            <Radio size={14} aria-hidden /> Arc · x402
          </span>
        </div>
      </section>
    </div>
  );
}
