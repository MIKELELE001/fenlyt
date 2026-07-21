"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { DemandCard } from "./DemandCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ButtonLink } from "@/components/shared/ButtonLink";
import type { DemandSignalItem, ListDemandResponse } from "@/lib/types/demand";
import styles from "./DemandList.module.css";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; signals: DemandSignalItem[] };

export function DemandList() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/demand");
        if (!res.ok) throw new Error("Request failed");
        const data: ListDemandResponse = await res.json();
        if (active) setState({ status: "ready", signals: data.signals });
      } catch {
        if (active) {
          setState({
            status: "error",
            message: "We couldn't load requested topics. Please try again.",
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <LoadingState label="Loading requested topics…" />;
  }

  if (state.status === "error") {
    return <ErrorState message={state.message} />;
  }

  if (state.signals.length === 0) {
    return (
      <EmptyState
        title="No requested topics yet"
        description="When someone asks a question no registered source can answer, it shows up here as an opportunity to register content."
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
      {state.signals.map((signal) => (
        <DemandCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}
