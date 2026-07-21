import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import styles from "./Button.module.css";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
};

/**
 * A Next.js Link styled identically to <Button>. Used for navigation actions
 * so we never nest a <button> inside an <a>.
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  leftIcon,
  fullWidth = false,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
      )}
    >
      {leftIcon}
      <span>{children}</span>
    </Link>
  );
}
