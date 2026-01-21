"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAttendanceForMatch, updateAttendance } from "@/lib/mock-data";
import type { AttendanceStatus, MatchAttendance, Player } from "@/lib/types";
import { ATTENDANCE_STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchAttendanceTabProps {
  matchId: string;
  players: Player[];
}

export function MatchAttendanceTab({ matchId, players }: MatchAttendanceTabProps) {
  const [attendance, setAttendance] = useState<MatchAttendance[]>([]);

  useEffect(() => {
    setAttendance(getAttendanceForMatch(matchId));
  }, [matchId]);

  const handleStatusChange = (playerId: string, status: AttendanceStatus) => {
    const updatedAttendance = updateAttendance(matchId, playerId, status);
    setAttendance(prev => 
      prev.map(a => a.playerId === playerId ? updatedAttendance : a)
    );
  };
  
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
        case 'presente': return 'border-green-500';
        case 'assente': return 'border-red-500';
        case 'in dubbio': return 'border-yellow-500';
        default: return 'border-transparent';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convocazioni</CardTitle>
        <CardDescription>Gestisci le presenze dei giocatori per la partita.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map(player => {
            const playerAttendance = attendance.find(a => a.playerId === player.id);
            const status = playerAttendance?.status || 'in dubbio';

            return (
                <div key={player.id} className={cn("flex items-center justify-between p-3 rounded-lg border-2", getStatusColor(status))}>
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

                    <RadioGroup 
                        defaultValue={status}
                        onValueChange={(value) => handleStatusChange(player.id, value as AttendanceStatus)}
                        className="flex items-center space-x-4"
                    >
                        {ATTENDANCE_STATUSES.map(s => (
                             <div key={s} className="flex items-center space-x-2">
                                <RadioGroupItem value={s} id={`${player.id}-${s}`} />
                                <Label htmlFor={`${player.id}-${s}`} className="capitalize">{s}</Label>
                             </div>
                        ))}
                    </RadioGroup>
                </div>
            )
        })}
      </CardContent>
    </Card>
  );
}
