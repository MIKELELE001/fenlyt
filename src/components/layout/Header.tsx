import { DevModeBadge } from "@/components/shared/DevModeBadge";
import styles from "./Header.module.css";

/**
 * Top bar of the app shell. Server component — reads the server-only
 * PAYMENT_MODE for the global mock badge. No sign-in/account UI since the
 * demo runs with no auth wall (every route is public).
 */
export async function Header() {
  const isMock = process.env.PAYMENT_MODE !== "real";

  return (
    <header className={styles.header}>
      <div className={styles.network}>
        <span className={styles.dot} aria-hidden />
        <span>Arc testnet</span>
        <span className={styles.divider} aria-hidden>
          ·
        </span>
        <span>USDC</span>
      </div>

      <div className={styles.right}>{isMock && <DevModeBadge />}</div>
    </header>
  );
}
