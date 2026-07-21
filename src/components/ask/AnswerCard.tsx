import { Sparkles } from "lucide-react";
import styles from "./AnswerCard.module.css";

/**
 * The agent's answer. When `grounded` (default), inline [Source N] markers are
 * produced by the model and mapped to paid sources by the CitationList below.
 * When not grounded, the answer came from general knowledge and no source was
 * paid (see GeneralAnswerNotice).
 */
export function AnswerCard({
  answer,
  grounded = true,
}: {
  answer: string;
  grounded?: boolean;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden>
          <Sparkles size={15} />
        </span>
        <h2 className={styles.title}>
          {grounded ? "Grounded answer" : "General-knowledge answer"}
        </h2>
      </div>
      <div className={styles.body}>
        {answer.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
