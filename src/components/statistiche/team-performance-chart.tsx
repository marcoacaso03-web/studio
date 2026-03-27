"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function TeamPerformanceChart() {
    const { teamTrend } = useStatsStore();

    if (!teamTrend || teamTrend.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Andamento Risultati</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Registra una partita per vedere l'andamento.</p>
                </CardContent>
            </Card>
        );
    }
    
    const chartConfig = {
        value: {
            label: "Esito",
            color: "hsl(var(--primary))",
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Andamento Risultati</CardTitle>
                <CardDescription className="text-xs">
                    Sequenza cronologica di Vittorie (V), Pareggi (P) e Sconfitte (S).
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart 
                            data={teamTrend} 
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                            <XAxis 
                                dataKey="date" 
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 10, fontWeight: 600 }}
                            />
                            <YAxis 
                                domain={[-1.2, 1.2]} 
                                ticks={[-1, 0, 1]} 
                                tickFormatter={(val) => {
                                    if (val === 1) return 'V';
                                    if (val === -1) return 'S';
                                    return 'P';
                                }}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fontWeight: 800, fill: "hsl(var(--foreground))" }}
                            />
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const resultLabel = data.value === 1 ? 'Vittoria' : data.value === -1 ? 'Sconfitta' : 'Pareggio';
                                        const resultColor = "text-foreground font-black";
                                        
                                        return (
                                            <div className="bg-background border rounded-lg p-2 shadow-md text-[10px] md:text-xs">
                                                <p className="font-bold border-b pb-1 mb-1">{data.date}</p>
                                                <p className="text-muted-foreground">Avversario: <span className="text-foreground font-semibold">{data.opponent}</span></p>
                                                <p className="mt-1">Risultato: <span className={`font-black ${resultColor}`}>{resultLabel}</span></p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} 
                            />
                            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={4}
                                dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                                activeDot={{ r: 7, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}