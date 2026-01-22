import type { Player } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PlayerCardProps = {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
};

export function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col items-center text-center relative">
        <div className="absolute top-2 right-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Apri menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onEdit}>Modifica</DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                      Elimina
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
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
