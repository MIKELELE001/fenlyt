import { AskForm } from "@/components/ask/AskForm";
import styles from "./AskPage.module.css";

export default function AskPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ask Scribe</h1>
        <p className={styles.subtitle}>
          The agent ranks registered sources, autonomously pays to unlock the
          best matches, and returns a grounded answer with a payment receipt.
        </p>
      </header>

      <AskForm />
    </div>
  );
}
