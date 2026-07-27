"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { TextArea } from "@/components/shared/TextArea";
import { Button } from "@/components/shared/Button";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { askSchema, type AskFormValues } from "@/lib/validation/ask";
import type { FenlytQueryResponse } from "@/app/api/fenlyt/query/route";
import { ResultDashboard } from "./ResultDashboard";
import styles from "./FenlytForm.module.css";

type FenlytState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "answered"; result: Extract<FenlytQueryResponse, { success: true }> };

export function FenlytForm() {
  const [state, setState] = useState<FenlytState>({ status: "idle" });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AskFormValues>({
    resolver: zodResolver(askSchema),
    defaultValues: { question: "" },
  });

  async function onSubmit(values: AskFormValues) {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/fenlyt/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: FenlytQueryResponse = await res.json();
      if (data.success) {
        setState({ status: "answered", result: data });
      } else {
        setState({ status: "error", message: data.error });
      }
    } catch {
      setState({
        status: "error",
        message: "We couldn't reach Fenlyt. Please try again.",
      });
    }
  }

  const isLoading = state.status === "loading";

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextArea
          label="Ask Fenlyt"
          rows={3}
          placeholder="Is this token safe? What's the sentiment on ETH? Give me a brief on SOL…"
          hint="Token safety, wallet reputation, market sentiment, or a quick asset brief."
          error={errors.question?.message}
          disabled={isLoading}
          {...register("question")}
        />
        <div className={styles.actions}>
          <Button type="submit" loading={isLoading} leftIcon={<Search size={16} />}>
            Ask Fenlyt
          </Button>
        </div>
      </form>

      {isLoading && (
        <LoadingState label="Classifying, pulling market data, and paying the query fee…" />
      )}

      {state.status === "error" && <ErrorState message={state.message} />}

      {state.status === "answered" && <ResultDashboard result={state.result} />}
    </div>
  );
}
