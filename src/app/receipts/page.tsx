import { ReceiptList } from "@/components/receipts/ReceiptList";
import styles from "./ReceiptsPage.module.css";

export default function ReceiptsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>
          Every query fee Fenlyt has settled autonomously.
        </p>
      </header>

      <ReceiptList />
    </div>
  );
}
