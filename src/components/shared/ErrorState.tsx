import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import styles from "./ErrorState.module.css";

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.icon} aria-hidden>
        <AlertCircle size={22} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
