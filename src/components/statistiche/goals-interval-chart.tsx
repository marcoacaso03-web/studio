"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function GoalsIntervalChart() {
    const { goalsIntervals } = useStatsStore();

    const hasData = goalsIntervals.some(item => item.value > 0);

    if (!hasData) {
        return (
            <Card className="bg-black/40 border-brand-green/30 shadow-[0_0_15px_rgba(172,229,4,0.05)] rounded-3xl overflow-hidden backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-base font-black uppercase tracking-tight text-brand-green">Distribuzione Gol</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest text-center py-10 opacity-50">Nessun gol segnato finora.</p>
                </CardContent>
            </Card>
        );
    }
    
    const chartConfig = {
        value: {
            label: "Gol",
        }
    };

    return (
        <Card className="bg-black/40 border-brand-green/30 shadow-[0_0_15px_rgba(172,229,4,0.05)] rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-black uppercase tracking-tight text-brand-green">Gol per Intervallo</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Distribuzione dei gol segnati nei diversi momenti della gara.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={goalsIntervals}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                stroke="none"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                labelLine={false}
                            >
                                {goalsIntervals.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: '16px', border: '1px solid rgba(172,229,4,0.3)', color: '#fff', fontSize: '12px', fontWeight: '900' }}
                                itemStyle={{ color: '#ace504' }}
                            />
                            <Legend 
                                iconType="circle" 
                                wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}