import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AltroPage() {
  return (
    <div>
      <PageHeader title="Altro" />
       <Card>
        <CardHeader>
          <CardTitle>In Costruzione</CardTitle>
          <CardDescription>
            Questa sezione è in fase di sviluppo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Qui troverai impostazioni, opzioni di export e altre utilità.</p>
        </CardContent>
      </Card>
    </div>
  );
}
