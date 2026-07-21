import Link from "next/link";
import { LogOut } from "lucide-react";
import { DevModeBadge } from "@/components/shared/DevModeBadge";
import { auth, signOut } from "@/lib/auth";
import styles from "./Header.module.css";

// Derive up-to-two-letter initials for the avatar from a name or email.
function initials(name?: string | null, email?: string | null): string {
  const base = name?.trim() || email?.split("@")[0] || "?";
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? base;
  const letters =
    parts.length > 1 ? `${first[0] ?? ""}${parts[1]?.[0] ?? ""}` : base.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Top bar of the app shell. Server component — reads the server-only
 * PAYMENT_MODE for the global mock badge (CLAUDE.md §6) and the signed-in
 * creator for the account menu (added post-spec alongside Google auth).
 */
export async function Header() {
  const isMock = process.env.PAYMENT_MODE !== "real";
  const session = await auth();
  const user = session?.user;

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

      <div className={styles.right}>
        {isMock && <DevModeBadge />}
        {user ? (
          <div className={styles.user}>
            <span className={styles.avatar} aria-hidden>
              {initials(user.name, user.email)}
            </span>
            <span className={styles.userName}>{user.name ?? user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className={styles.signOut} title="Sign out">
                <LogOut size={16} aria-hidden />
                <span className={styles.signOutLabel}>Sign out</span>
              </button>
            </form>
          </div>
        ) : (
          <Link href="/signin" className={styles.signIn}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
