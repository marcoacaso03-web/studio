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
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Errore" />
      <ErrorState 
        error={parseError(error)} 
        onRetry={() => reset()} 
        fullScreen 
      />
    </div>
  );
}
