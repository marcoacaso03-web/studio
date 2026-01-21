import { PageHeader } from "@/components/layout/page-header";
import { getMatchById, getPlayers } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MatchLineup } from "@/components/partite/match-lineup";
import { MatchStatsTab } from "@/components/partite/match-stats-tab";

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = getMatchById(params.id);
  const players = getPlayers();

  if (!match) {
    notFound();
  }

  const matchDate = new Date(match.date);

  return (
    <div>
      <PageHeader title={`Partita vs ${match.opponent}`} />
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Info Partita</TabsTrigger>
          <TabsTrigger value="convocati">Convocati</TabsTrigger>
          <TabsTrigger value="formazione">Formazione</TabsTrigger>
          <TabsTrigger value="statistiche">Statistiche</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Partita</CardTitle>
              <CardDescription>Informazioni generali sulla partita.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Data</p>
                  <p>{matchDate.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="font-semibold">Orario</p>
                  <p>{matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="font-semibold">Luogo</p>
                  <p>{match.location}</p>
                </div>
                <div>
                  <p className="font-semibold">Casa/Trasferta</p>
                  <p>{match.isHome ? "Partita in casa" : "Partita in trasferta"}</p>
                </div>
                 <div>
                  <p className="font-semibold">Risultato Finale</p>
                  <p className="text-2xl font-bold">{match.result ? `${match.result.home} - ${match.result.away}` : "Da giocare"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convocati">
          <Card>
            <CardHeader>
              <CardTitle>Convocazioni</CardTitle>
              <CardDescription>Gestisci le presenze dei giocatori per la partita.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint}/>
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id={`attendance-${player.id}`} />
                    <Label htmlFor={`attendance-${player.id}`}>Presente</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formazione">
            <MatchLineup />
        </TabsContent>

        <TabsContent value="statistiche">
          <MatchStatsTab players={players} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
