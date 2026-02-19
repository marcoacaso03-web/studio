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
            <Card>
                <CardHeader>
                    <CardTitle>Distribuzione Gol</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Nessun gol segnato finora.</p>
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
        <Card>
            <CardHeader>
                <CardTitle>Gol per Intervallo</CardTitle>
                <CardDescription>Distribuzione dei gol segnati nei diversi momenti della gara.</CardDescription>
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
                                paddingAngle={5}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {goalsIntervals.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}