import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./TextArea.module.css";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ label, error, hint, id, className, rows = 6, ...rest }, ref) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined;

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={fieldId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={clsx(
            styles.textarea,
            error && styles.textareaError,
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {error ? (
          <p id={`${fieldId}-error`} className={styles.error}>
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className={styles.hint}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
