import { DemandList } from "@/components/demand/DemandList";
import styles from "./DemandPage.module.css";

export default function DemandPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Requested topics</h1>
        <p className={styles.subtitle}>
          Questions people asked that no registered source could answer yet.
          Register content for a topic and earn the next time it&apos;s asked.
        </p>
      </header>

      <DemandList />
    </div>
  );
}
