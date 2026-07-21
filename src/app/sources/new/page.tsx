import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SourceForm } from "@/components/sources/SourceForm";
import styles from "./NewSourcePage.module.css";

export default function NewSourcePage() {
  return (
    <div className={styles.page}>
      <Link href="/sources" className={styles.back}>
        <ArrowLeft size={15} aria-hidden />
        Back to sources
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Register a source</h1>
        <p className={styles.subtitle}>
          Add your work and set a price per use. The agent pays this amount each
          time it cites your source in an answer.
        </p>
      </header>

      <SourceForm />
    </div>
  );
}
