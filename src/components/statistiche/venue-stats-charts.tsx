"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function VenueStatsCharts() {
    const { teamRecord, homeRecord, awayRecord } = useStatsStore();

    if (!teamRecord || teamRecord.matchesPlayed === 0) return null;

    const prepareData = (record: any) => [
        { name: 'VITTORIE', value: record.wins, fill: "hsl(var(--primary))" },
        { name: 'PAREGGI', value: record.draws, fill: "hsl(var(--muted-foreground))" },
        { name: 'SCONFITTE', value: record.losses, fill: "hsl(var(--accent))" }
    ].filter(d => d.value > 0);

    const chartConfig = {
        value: { label: "Partite" }
    };

    const SmallPieChart = ({ title, data, total }: { title: string, data: any[], total: number }) => (
        <div className="flex flex-col items-center">
            <h4 className="text-[10px] font-black uppercase mb-2 tracking-widest text-muted-foreground">{title}</h4>
            <div className="h-32 w-32 relative">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={40}
                                paddingAngle={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-black leading-none">{total}</span>
                    <span className="text-[8px] font-bold opacity-50 uppercase">Gare</span>
                </div>
            </div>
        </div>
    );

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Rendimento per Sede</CardTitle>
                <CardDescription className="text-xs">Distribuzione esiti Totale, In Casa e In Trasferta.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-2">
                    <SmallPieChart title="Totale" data={prepareData(teamRecord)} total={teamRecord.matchesPlayed} />
                    <SmallPieChart title="In Casa" data={prepareData(homeRecord || {})} total={homeRecord?.matchesPlayed || 0} />
                    <SmallPieChart title="Trasferta" data={prepareData(awayRecord || {})} total={awayRecord?.matchesPlayed || 0} />
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-[9px] font-black uppercase">Vittoria</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                        <span className="text-[9px] font-black uppercase">Pareggio</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                        <span className="text-[9px] font-black uppercase">Sconfitta</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}