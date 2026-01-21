import { PageHeader } from "@/components/layout/page-header";
import { PlayerCard } from "@/components/squadra/player-card";
import { getPlayers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function MembriPage() {
  const players = getPlayers();

  return (
    <div>
      <PageHeader title="Membri">
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Aggiungi Giocatore
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
