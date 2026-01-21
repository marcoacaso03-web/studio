"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AttendanceStatus } from "@/lib/types";
import { ATTENDANCE_STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";

export function MatchAttendanceTab() {
  const { allPlayers, attendance, updateAttendance } = useMatchDetailStore();

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
        {allPlayers.map(player => {
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
                        value={status}
                        onValueChange={(value) => updateAttendance(player.id, value as AttendanceStatus)}
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
