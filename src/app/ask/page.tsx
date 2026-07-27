import { FenlytForm } from "@/components/ask/FenlytForm";
import styles from "./AskPage.module.css";

export default function AskPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ask Fenlyt</h1>
        <p className={styles.subtitle}>
          Token safety, wallet reputation, market sentiment, or a quick asset
          brief — Fenlyt pulls live data and pays the query fee autonomously.
        </p>
      </header>

      <FenlytForm />
    </div>
  );
}
