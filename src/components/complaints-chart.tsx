"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import * as React from "react";

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Complaint } from "@/lib/types";

interface ComplaintsChartProps {
    complaints: Complaint[];
}


const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
}

export function ComplaintsChart({ complaints }: ComplaintsChartProps) {
    const chartData = React.useMemo(() => {
        if (!complaints || complaints.length === 0) return [];

        const categoryCounts = complaints.reduce((acc, complaint) => {
            const category = complaint.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count
        })).sort((a,b) => b.count - a.count);

    }, [complaints]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-[350px] text-muted-foreground">No complaint data to display.</div>
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 0 }}>
          <XAxis
            dataKey="category"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
