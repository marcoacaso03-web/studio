import type { Player } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type PlayerCardProps = {
  player: Player;
};

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl">{player.name}</CardTitle>
        <CardDescription>#{player.number}</CardDescription>
        <Badge variant="secondary" className="mt-2">{player.role}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-around text-center">
          <div>
            <p className="font-bold text-lg">{player.stats.appearances}</p>
            <p className="text-xs text-muted-foreground">Presenze</p>
          </div>
          <div>
            <p className="font-bold text-lg">{player.stats.goals}</p>
            <p className="text-xs text-muted-foreground">Gol</p>
          </div>
          <div>
            <p className="font-bold text-lg">{player.stats.assists}</p>
            <p className="text-xs text-muted-foreground">Assist</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
