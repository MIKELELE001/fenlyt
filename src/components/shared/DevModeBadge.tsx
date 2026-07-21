import { FlaskConical } from "lucide-react";
import styles from "./DevModeBadge.module.css";

type DevModeBadgeProps = {
  label?: string;
};

/**
 * Amber pill shown wherever payment info is displayed while running in mock
 * mode (PAYMENT_MODE=mock). Driven by the `isMock` flag carried on receipt /
 * payment data so the client never needs to read the server-side env var.
 */
export function DevModeBadge({
  label = "DEV MODE — Mock Payment",
}: DevModeBadgeProps) {
  return (
    <span className={styles.badge}>
      <FlaskConical size={12} aria-hidden />
      {label}
    </span>
  );
}
