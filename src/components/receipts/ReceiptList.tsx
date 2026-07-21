"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ReceiptCard } from "./ReceiptCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ButtonLink } from "@/components/shared/ButtonLink";
import type {
  ListReceiptsResponse,
  ReceiptListItem,
} from "@/lib/types/receipt";
import styles from "./ReceiptList.module.css";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; receipts: ReceiptListItem[] };

export function ReceiptList() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/receipts");
        if (!res.ok) throw new Error("Request failed");
        const data: ListReceiptsResponse = await res.json();
        if (active) setState({ status: "ready", receipts: data.receipts });
      } catch {
        if (active) {
          setState({
            status: "error",
            message: "We couldn't load receipts. Please try again.",
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <LoadingState label="Loading receipts…" />;
  }

  if (state.status === "error") {
    return <ErrorState message={state.message} />;
  }

  if (state.receipts.length === 0) {
    return (
      <EmptyState
        title="No receipts yet"
        description="Ask Scribe a question — the agent pays each cited source and a receipt appears here."
        action={
          <ButtonLink href="/ask" leftIcon={<Sparkles size={16} />}>
            Ask Scribe
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className={styles.list}>
      {state.receipts.map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} />
      ))}
    </div>
  );
}
