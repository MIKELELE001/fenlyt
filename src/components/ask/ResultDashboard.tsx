import { ShieldAlert, Wallet, TrendingUp, FileText, Receipt, Ban } from "lucide-react";
import type { FenlytQueryResponse } from "@/app/api/fenlyt/query/route";
import styles from "./ResultDashboard.module.css";

type Success = Extract<FenlytQueryResponse, { success: true }>;

const CATEGORY_META: Record<string, { label: string; icon: typeof ShieldAlert }> = {
  token_safety: { label: "Token Safety", icon: ShieldAlert },
  wallet_check: { label: "Wallet Check", icon: Wallet },
  sentiment: { label: "Market Sentiment", icon: TrendingUp },
  brief: { label: "Asset Brief", icon: FileText },
};

// Splits the model's answer into a lead verdict line + supporting bullets so
// the hero card and detail cards render distinctly instead of one text blob.
function splitAnswer(answer: string): { lead: string; rest: string[] } {
  const lines = answer.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletStart = lines.findIndex((l) => /^[-*•]/.test(l));
  if (bulletStart === -1) {
    return { lead: lines.join(" "), rest: [] };
  }
  return {
    lead: lines.slice(0, bulletStart).join(" "),
    rest: lines.slice(bulletStart).map((l) => l.replace(/^[-*•]\s*/, "")),
  };
}

export function ResultDashboard({ result }: { result: Success }) {
  if (result.outOfScope) {
    return (
      <div className={styles.outOfScope}>
        <Ban size={20} aria-hidden />
        <p>{result.answer}</p>
      </div>
    );
  }

  const meta = result.category ? CATEGORY_META[result.category] : undefined;
  const Icon = meta?.icon ?? FileText;
  const { lead, rest } = splitAnswer(result.answer);

  return (
    <div className={styles.grid}>
      <div className={styles.hero}>
        <div className={styles.heroHeader}>
          <span className={styles.categoryBadge}>
            <Icon size={14} aria-hidden />
            {meta?.label ?? "Research"}
          </span>
          {result.entity && <span className={styles.entity}>{result.entity}</span>}
        </div>
        <p className={styles.heroText}>{lead}</p>
      </div>

      {rest.map((point, i) => (
        <div key={i} className={styles.card}>
          <p className={styles.cardText}>{point}</p>
        </div>
      ))}

      <div className={styles.footerCard}>
        <Receipt size={16} aria-hidden />
        <span>
          ${result.amountUsd} paid
          {result.payment?.isMock ? " (mock)" : ""} ·{" "}
          {result.payment?.status === "SUCCEEDED" ? "settled" : "pending"}
        </span>
      </div>
    </div>
  );
}
