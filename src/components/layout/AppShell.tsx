"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LineChart, Home, Search, ReceiptText } from "lucide-react";
import styles from "./AppShell.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ask", label: "Research", icon: Search },
  { href: "/receipts", label: "History", icon: ReceiptText },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppShellProps = {
  header: ReactNode;
  children: ReactNode;
};

export function AppShell({ header, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden>
            <LineChart size={18} />
          </span>
          <span className={styles.brandName}>Fenlyt</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <p className={styles.navLabel}>Menu</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                styles.navItem,
                isActive(pathname, href) && styles.navItemActive,
              )}
              aria-current={isActive(pathname, href) ? "page" : undefined}
            >
              <Icon size={17} aria-hidden />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.footerTitle}>Affordable market intelligence</p>
          <p className={styles.footerText}>
            Pay per query — cents, not subscriptions.
          </p>
        </div>
      </aside>

      <div className={styles.main}>
        {header}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
