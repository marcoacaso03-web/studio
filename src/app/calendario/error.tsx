"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { parseError } from "@/lib/error-utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Errore Calendario:", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Calendario" />
      <ErrorState 
        error={parseError(error)} 
        onRetry={() => reset()} 
      />
    </div>
  );
}
