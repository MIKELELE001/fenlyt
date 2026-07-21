import { ReceiptList } from "@/components/receipts/ReceiptList";
import styles from "./ReceiptsPage.module.css";

export default function ReceiptsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Receipts</h1>
        <p className={styles.subtitle}>
          Every micropayment the Scribe agent has settled to unlock sources.
        </p>
      </header>

      <ReceiptList />
    </div>
  );
}
