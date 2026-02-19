"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function TeamPerformanceChart() {
    const { teamTrend } = useStatsStore();

    if (!teamTrend || teamTrend.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Andamento Risultati</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Gioca qualche partita per vedere l'andamento.</p>
                </CardContent>
            </Card>
        );
    }
    
    const chartConfig = {
        value: {
            label: "Esito",
            color: "hsl(var(--primary))",
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Andamento Risultati</CardTitle>
                <CardDescription>Visualizza la sequenza di vittorie (1), pareggi (0) e sconfitte (-1).</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={teamTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <YAxis 
                                domain={[-1.2, 1.2]} 
                                ticks={[-1, 0, 1]} 
                                tickFormatter={(val) => val === 1 ? 'V' : val === -1 ? 'S' : 'P'}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<ChartTooltipContent />} />
                            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={3}
                                dot={{ r: 6, fill: "hsl(var(--primary))" }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}