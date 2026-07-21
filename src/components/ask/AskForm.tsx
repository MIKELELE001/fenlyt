"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Sparkles } from "lucide-react";
import { TextArea } from "@/components/shared/TextArea";
import { Button } from "@/components/shared/Button";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnswerCard } from "./AnswerCard";
import { CitationList } from "./CitationList";
import { ReceiptSummary } from "./ReceiptSummary";
import { GeneralAnswerNotice } from "./GeneralAnswerNotice";
import { askSchema, type AskFormValues } from "@/lib/validation/ask";
import type { AskResponse } from "@/lib/types/query";
import styles from "./AskForm.module.css";

type AskSuccess = Extract<AskResponse, { success: true }>;

type AskState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty"; message: string }
  | { status: "answered"; result: AskSuccess };

export function AskForm() {
  const [state, setState] = useState<AskState>({ status: "idle" });
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
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: AskResponse = await res.json();
      if (data.success) {
        setState({ status: "answered", result: data });
      } else if (data.empty) {
        setState({ status: "empty", message: data.error });
      } else {
        setState({ status: "error", message: data.error });
      }
    } catch {
      setState({
        status: "error",
        message: "We couldn't reach the agent. Please try again.",
      });
    }
  }

  const isLoading = state.status === "loading";

  return (
    <div className={styles.wrapper}>
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <TextArea
          label="Your question"
          rows={4}
          placeholder="Ask anything…"
          hint="The agent grounds on registered sources and pays them when relevant — otherwise it answers from general knowledge for free."
          error={errors.question?.message}
          disabled={isLoading}
          {...register("question")}
        />
        <div className={styles.actions}>
          <Button
            type="submit"
            loading={isLoading}
            leftIcon={<Sparkles size={16} />}
          >
            Ask Scribe
          </Button>
        </div>
      </form>

      {isLoading && (
        <LoadingState label="Agent is ranking sources, paying, and answering…" />
      )}

      {state.status === "error" && (
        <ErrorState message={state.message} />
      )}

      {state.status === "empty" && (
        <EmptyState
          title="No relevant sources"
          description={state.message}
          icon={<AlertCircle size={22} />}
        />
      )}

      {state.status === "answered" && (
        <div className={styles.result}>
          <AnswerCard
            answer={state.result.answer}
            grounded={state.result.sourced}
          />
          {state.result.sourced && state.result.receipt ? (
            <>
              <CitationList citations={state.result.citations} />
              <ReceiptSummary
                receipt={state.result.receipt}
                totalPaymentUsd={state.result.totalPaymentUsd}
              />
            </>
          ) : (
            <GeneralAnswerNotice />
          )}
        </div>
      )}
    </div>
  );
}
