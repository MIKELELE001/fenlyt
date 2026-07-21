import { Info, PlusCircle } from "lucide-react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import styles from "./GeneralAnswerNotice.module.css";

/**
 * Shown in place of citations + receipt when an answer came from the model's
 * general knowledge because no registered source matched. Makes the "no payment
 * was made" state explicit and nudges creators to register content.
 */
export function GeneralAnswerNotice() {
  return (
    <aside className={styles.notice}>
      <span className={styles.icon} aria-hidden>
        <Info size={16} />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>Answered from general knowledge</p>
        <p className={styles.text}>
          No registered source matched this question, so no payment was made.
          Know this topic? Register a source and earn when it&apos;s asked next.
        </p>
        <div className={styles.action}>
          <ButtonLink
            href="/sources/new"
            variant="secondary"
            size="sm"
            leftIcon={<PlusCircle size={15} />}
          >
            Register a source
          </ButtonLink>
        </div>
      </div>
    </aside>
  );
}
