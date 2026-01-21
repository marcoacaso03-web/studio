"use client";

import { useState } from "react";
import { getPlayers } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MatchLineup() {
  // Mock lineup data for demonstration
  const allPlayers = getPlayers();
  const [starters, setStarters] = useState(allPlayers.slice(0, 11));
  const [substitutes, setSubstitutes] = useState(allPlayers.slice(11));

  const formations: { [key: string]: number[] } = {
    "4-4-2": [1, 4, 4, 2],
    "4-3-3": [1, 4, 3, 3],
    "3-5-2": [1, 3, 5, 2],
  };
  const [formation, setFormation] = useState("4-4-2");
  const formationLayout = formations[formation];

  const getPlayersForLine = (lineIndex: number) => {
    let startIndex = 0;
    for (let i = 0; i < lineIndex; i++) {
      startIndex += formationLayout[i];
    }
    return starters.slice(startIndex, startIndex + formationLayout[lineIndex]);
  };
  
  const PlayerAvatar = ({ player }: { player: any }) => (
    <div className="flex flex-col items-center gap-1 group cursor-pointer">
      <Avatar className="w-12 h-12 border-2 border-primary group-hover:border-accent">
        <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
        <AvatarFallback>{player.name.slice(0,1)}</AvatarFallback>
      </Avatar>
      <span className="text-xs font-semibold bg-background/80 px-1 rounded">{player.name.split(' ')[1]}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Formazione Titolare (4-4-2)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-600/20 border-2 border-green-600/50 rounded-lg p-4 relative aspect-[7/5]">
              {/* Field Markings */}
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-green-600/50 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-green-600/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-600/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute inset-y-0 left-0 w-24 border-r-2 border-green-600/50"></div>
              <div className="absolute inset-y-0 right-0 w-24 border-l-2 border-green-600/50"></div>

              <div className="h-full w-full flex flex-col justify-around text-white z-10">
                {formationLayout.slice().reverse().map((numPlayers, lineIndex) => (
                  <div key={lineIndex} className="flex justify-around items-center">
                    {getPlayersForLine(formationLayout.length - 1 - lineIndex).map((player) => (
                      <PlayerAvatar key={player.id} player={player} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Panchina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allPlayers.slice(7).map(player => (
              <div key={player.id} className="flex items-center gap-3 p-2 border rounded-md">
                 <Avatar className="w-8 h-8">
                    <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                    <AvatarFallback>{player.name.slice(0,1)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.role}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
