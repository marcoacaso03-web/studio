"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function TeamPerformanceChart() {
    const { teamRecord } = useStatsStore();

    if (!teamRecord || teamRecord.matchesPlayed === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Andamento Squadra</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Nessun dato disponibile. Gioca qualche partita per vedere il grafico.</p>
                </CardContent>
            </Card>
        );
    }
    
    const chartData = [
        { name: 'Vittorie', value: teamRecord.wins, fill: "hsl(var(--chart-2))" },
        { name: 'Pareggi', value: teamRecord.draws, fill: "hsl(var(--chart-4))" },
        { name: 'Sconfitte', value: teamRecord.losses, fill: "hsl(var(--chart-1))" },
    ];
    
    const chartConfig = {
        value: {
            label: "Partite",
        },
        Vittorie: {
            label: "Vittorie",
            color: "hsl(var(--chart-2))",
        },
        Pareggi: {
            label: "Pareggi",
            color: "hsl(var(--chart-4))",
        },
        Sconfitte: {
            label: "Sconfitte",
            color: "hsl(var(--chart-1))",
        },
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Andamento Stagionale</CardTitle>
                <CardDescription>Riepilogo visivo dei risultati della squadra.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false}
                                tickMargin={10}
                            />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                            <Bar dataKey="value" name="Partite" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
