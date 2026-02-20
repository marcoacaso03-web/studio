"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function GoalVenueCharts() {
    const { homeRecord, awayRecord } = useStatsStore();

    if (!homeRecord || !awayRecord) return null;
    if (homeRecord.matchesPlayed === 0 && awayRecord.matchesPlayed === 0) return null;

    const scoredData = [
        { name: 'IN CASA', value: homeRecord.goalsFor, fill: "hsl(var(--primary))" },
        { name: 'TRASFERTA', value: awayRecord.goalsFor, fill: "hsl(var(--accent))" }
    ].filter(d => d.value > 0);

    const concededData = [
        { name: 'IN CASA', value: homeRecord.goalsAgainst, fill: "hsl(var(--primary))" },
        { name: 'TRASFERTA', value: awayRecord.goalsAgainst, fill: "hsl(var(--accent))" }
    ].filter(d => d.value > 0);

    const chartConfig = {
        value: { label: "Gol" }
    };

    const GoalPieChart = ({ title, data, total }: { title: string, data: any[], total: number }) => (
        <div className="flex flex-col items-center">
            <h4 className="text-[10px] font-black uppercase mb-2 tracking-widest text-muted-foreground">{title}</h4>
            <div className="h-40 w-40 relative">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={55}
                                paddingAngle={4}
                                label={({ value }) => `${value}`}
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
                    <span className="text-xl font-black leading-none">{total}</span>
                    <span className="text-[8px] font-bold opacity-50 uppercase">Totali</span>
                </div>
            </div>
        </div>
    );

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Bilancio Reti:</CardTitle>
                <CardDescription className="text-xs">Distribuzione gol fatti e subiti tra casa e trasferta.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <GoalPieChart 
                        title="Gol Fatti" 
                        data={scoredData} 
                        total={homeRecord.goalsFor + awayRecord.goalsFor} 
                    />
                    <GoalPieChart 
                        title="Gol Subiti" 
                        data={concededData} 
                        total={homeRecord.goalsAgainst + awayRecord.goalsAgainst} 
                    />
                </div>
                <div className="flex justify-center gap-6 mt-6 border-t pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-tight">In Casa</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Trasferta</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}