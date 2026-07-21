"use client";

import { useEffect, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { SourceCard } from "./SourceCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ButtonLink } from "@/components/shared/ButtonLink";
import type { ListSourcesResponse, SourceListItem } from "@/lib/types/source";
import styles from "./SourceList.module.css";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; sources: SourceListItem[] };

export function SourceList() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/sources");
        if (!res.ok) throw new Error("Request failed");
        const data: ListSourcesResponse = await res.json();
        if (active) setState({ status: "ready", sources: data.sources });
      } catch {
        if (active) {
          setState({
            status: "error",
            message: "We couldn't load your sources. Please try again.",
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <LoadingState label="Loading sources…" />;
  }

  if (state.status === "error") {
    return <ErrorState message={state.message} />;
  }

  if (state.sources.length === 0) {
    return (
      <EmptyState
        title="No sources yet"
        description="Register your first source so the Scribe agent can cite and pay for it."
        action={
          <ButtonLink href="/sources/new" leftIcon={<FilePlus2 size={16} />}>
            Add source
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className={styles.list}>
      {state.sources.map((source) => (
        <SourceCard key={source.id} source={source} />
      ))}
    </div>
  );
}
