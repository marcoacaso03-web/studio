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
            color: "#ace504",
        }
    };

    return (
        <Card className="bg-black/40 border-brand-green/30 shadow-[0_0_15px_rgba(172,229,4,0.05)] rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-black uppercase tracking-tight text-brand-green">Andamento Risultati</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">
                    Sequenza cronologica di Vittorie (V), Pareggi (P) e Sconfitte (S).
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart 
                            data={teamTrend} 
                            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                             <XAxis 
                                dataKey="date" 
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                tick={{ fontSize: 9, fontWeight: 900, fill: "rgba(255, 255, 255, 0.3)" }}
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
                                tick={{ fontSize: 11, fontStyle: 'italic', fontWeight: 900, fill: "rgba(255, 255, 255, 0.5)" }}
                            />
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const resultLabel = data.value === 1 ? 'Vittoria' : data.value === -1 ? 'Sconfitta' : 'Pareggio';
                                        const resultColor = data.value === 1 ? "text-brand-green" : data.value === -1 ? "text-rose-500" : "text-white/60";
                                        
                                        return (
                                            <div className="bg-black/90 border border-brand-green/30 backdrop-blur-md rounded-2xl p-3 shadow-2xl text-[10px] min-w-[140px]">
                                                <p className="font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2 mb-2">{data.date}</p>
                                                <p className="text-white/60 font-black uppercase tracking-tighter mb-1 select-none">Avversario</p>
                                                <p className="text-sm font-black text-white mb-2 uppercase tracking-tight">{data.opponent}</p>
                                                <p className="font-black pt-2 border-t border-white/5 uppercase tracking-widest text-[9px] opacity-40 mb-1">Risultato</p>
                                                <p className={`text-base font-black uppercase italic ${resultColor}`}>{resultLabel}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} 
                            />
                            <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.1)" />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#ace504" 
                                strokeWidth={4}
                                dot={{ r: 4, fill: "#ace504", strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: "#ace504", strokeWidth: 4, stroke: "rgba(172, 229, 4, 0.2)" }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}