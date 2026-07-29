import Link from "next/link";
import { Feather } from "lucide-react";
import { signIn } from "@/lib/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";
import styles from "./SignInPage.module.css";

// Human-readable copy for the error codes Auth.js appends as ?error=… .
function errorMessage(code?: string): string | null {
  if (!code) return null;
  if (code === "AccessDenied") return "Access was denied. Please try again.";
  if (code === "OAuthAccountNotLinked")
    return "That email is already linked to another sign-in method.";
  return "Could not sign you in. Please try again.";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = errorMessage(error);

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/sources" });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden>
            <Feather size={18} />
          </span>
          <span className={styles.brandName}>Fenlyt</span>
        </Link>

        <h1 className={styles.title}>Sign in to Fenlyt</h1>
        <p className={styles.sub}>
          Register sources, ask grounded questions, and track what you earn.
        </p>

        {message && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}

        <form action={signInWithGoogle} className={styles.form}>
          <GoogleButton />
        </form>

        <p className={styles.legal}>
          By continuing you agree to let Fenlyt create an account for you.
        </p>
      </div>
    </div>
  );
}
