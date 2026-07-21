import { Loader2 } from "lucide-react";
import styles from "./LoadingState.module.css";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <Loader2 className={styles.spinner} size={22} aria-hidden />
      <p className={styles.label}>{label}</p>
    </div>
  );
}
