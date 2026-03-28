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
        { name: 'IN CASA', value: homeRecord.goalsFor, fill: "#ace504" },
        { name: 'TRASFERTA', value: awayRecord.goalsFor, fill: "rgba(255, 255, 255, 0.4)" }
    ].filter(d => d.value > 0);

    const concededData = [
        { name: 'IN CASA', value: homeRecord.goalsAgainst, fill: "#ace504" },
        { name: 'TRASFERTA', value: awayRecord.goalsAgainst, fill: "rgba(255, 255, 255, 0.4)" }
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
                    <span className="text-2xl font-black leading-none text-white">{total}</span>
                    <span className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-1">Totali</span>
                </div>
            </div>
        </div>
    );

    return (
        <Card className="bg-black/40 border-brand-green/30 shadow-[0_0_15px_rgba(172,229,4,0.05)] rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-black uppercase tracking-tight text-brand-green">Bilancio Reti</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Distribuzione gol fatti e subiti tra casa e trasferta.</CardDescription>
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
                <div className="flex justify-center gap-6 mt-6 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ace504]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">In Casa</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Trasferta</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}