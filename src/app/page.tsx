import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatches, getPlayers } from "@/lib/mock-data";
import { Calendar, Users, Target } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const players = getPlayers();
  const matches = getMatches();
  const nextMatch = matches.find(m => new Date(m.date) > new Date() && m.status === 'scheduled');
  
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prossima Partita</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextMatch ? (
              <>
                <div className="text-2xl font-bold">vs {nextMatch.opponent}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(nextMatch.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link href={`/calendario/${nextMatch.id}`}>Vedi Dettagli</Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Nessuna partita in programma.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membri Squadra</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground">Giocatori registrati</p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href="/membri">Gestisci Squadra</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gol Stagionali</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {players.reduce((acc, p) => acc + p.stats.goals, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Totale gol segnati in stagione</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
            <CardHeader>
                <CardTitle>Benvenuto in Squadra+!</CardTitle>
                <CardDescription>La tua dashboard per la gestione completa della squadra. Da qui puoi vedere la prossima partita, gestire i membri del team e tenere traccia delle statistiche.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Usa la barra di navigazione in basso per navigare tra le sezioni.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
