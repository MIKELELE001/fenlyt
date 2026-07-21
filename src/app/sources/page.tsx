import { FilePlus2 } from "lucide-react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { SourceList } from "@/components/sources/SourceList";
import { EarningsSummary } from "@/components/sources/EarningsSummary";
import { auth } from "@/lib/auth";
import { getCreatorEarnings } from "@/lib/queries/getCreatorEarnings";
import styles from "./SourcesPage.module.css";

export default async function SourcesPage() {
  // Route is auth-gated by middleware, so a session is guaranteed here.
  const session = await auth();
  const earnings = session?.user
    ? await getCreatorEarnings(session.user.id)
    : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>My Sources</h1>
          <p className={styles.subtitle}>
            Work you&apos;ve registered for the Scribe agent to cite and pay for.
          </p>
        </div>
        <ButtonLink href="/sources/new" leftIcon={<FilePlus2 size={16} />}>
          Add source
        </ButtonLink>
      </header>

      {earnings && <EarningsSummary earnings={earnings} />}
      <SourceList />
    </div>
  );
}
