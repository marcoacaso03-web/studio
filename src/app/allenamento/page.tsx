
"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export default function AllenamentoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Allenamento" />
      <Card className="border-dashed bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
          <h3 className="text-xl font-black uppercase tracking-tight text-primary">Area Allenamenti</h3>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">
            Funzionalità in fase di sviluppo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
