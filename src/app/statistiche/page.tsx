import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatistichePage() {
  return (
    <div>
      <PageHeader title="Statistiche" />
      <Card>
        <CardHeader>
          <CardTitle>In Costruzione</CardTitle>
          <CardDescription>
            Questa sezione è in fase di sviluppo. Torna presto per vedere le statistiche della squadra!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Qui troverai grafici e dati sulle performance della squadra e dei singoli giocatori.</p>
        </CardContent>
      </Card>
    </div>
  );
}
