"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/shared/Input";
import { TextArea } from "@/components/shared/TextArea";
import { Button } from "@/components/shared/Button";
import { sourceSchema, type SourceFormValues } from "@/lib/validation/source";
import type { CreateSourceResponse } from "@/lib/types/source";
import styles from "./SourceForm.module.css";

export function SourceForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SourceFormValues>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      title: "",
      authorName: "",
      sourceType: "TEXT",
      sourceUrl: "",
      content: "",
      payoutAddress: "",
      pricePerUseUsd: "",
    },
  });

  async function onSubmit(values: SourceFormValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: CreateSourceResponse = await res.json();
      if (!data.success) {
        setSubmitError(data.error);
        return;
      }
      router.push("/sources");
      router.refresh();
    } catch {
      setSubmitError("Something went wrong while saving. Please try again.");
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <input type="hidden" {...register("sourceType")} />

      {submitError && (
        <div className={styles.banner} role="alert">
          <AlertCircle size={16} aria-hidden />
          {submitError}
        </div>
      )}

      <Input
        label="Title"
        placeholder="e.g. The economics of attention"
        error={errors.title?.message}
        {...register("title")}
      />
      <Input
        label="Author name"
        placeholder="e.g. Ada Lovelace"
        error={errors.authorName?.message}
        {...register("authorName")}
      />
      <Input
        label="Source URL (optional)"
        placeholder="https://example.com/article"
        error={errors.sourceUrl?.message}
        {...register("sourceUrl")}
      />
      <TextArea
        label="Content"
        rows={10}
        placeholder="Paste the full text the agent may cite…"
        hint="Minimum 100 characters. This is the material the agent pays to access."
        error={errors.content?.message}
        {...register("content")}
      />

      <div className={styles.row}>
        <Input
          label="Payout address"
          placeholder="0x… (Arc testnet wallet)"
          error={errors.payoutAddress?.message}
          {...register("payoutAddress")}
        />
        <Input
          label="Price per use (USD)"
          placeholder="0.01"
          inputMode="decimal"
          error={errors.pricePerUseUsd?.message}
          {...register("pricePerUseUsd")}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting}>
          Register source
        </Button>
      </div>
    </form>
  );
}
