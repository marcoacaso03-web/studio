"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
        <PageHeader title="Qualcosa è andato storto" />
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle>Oops! Si è verificato un errore.</CardTitle>
                <CardDescription>
                    L'applicazione ha riscontrato un problema imprevisto.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Puoi provare a ricaricare la pagina. Se il problema persiste, potrebbe essere un bug.
                </p>
                <Button
                    onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                    }
                >
                    Riprova
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
