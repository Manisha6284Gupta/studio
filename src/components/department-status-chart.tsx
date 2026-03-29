"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Complaint, ComplaintStatus } from "@/lib/types"

interface DepartmentStatusChartProps {
  complaints: Complaint[]
}

const chartConfig = {
  Resolved: {
    label: "Resolved",
    color: "hsl(var(--success))",
  },
  "In Progress": {
    label: "In Progress",
    color: "hsl(var(--primary))",
  },
  Pending: {
    label: "Pending",
    color: "hsl(var(--warning))",
  },
  Overdue: {
    label: "Overdue",
    color: "hsl(var(--destructive))",
  },
} satisfies {
  [key in ComplaintStatus]?: {
    label: string
    color: string
  }
}


export function DepartmentStatusChart({ complaints }: DepartmentStatusChartProps) {
  const chartData = React.useMemo(() => {
    const departmentData: {
      [key: string]: { [key in ComplaintStatus]: number } & { total: number }
    } = {}

    complaints.forEach((complaint) => {
      const { initialDepartmentId, status } = complaint
      if (!departmentData[initialDepartmentId]) {
        departmentData[initialDepartmentId] = {
          Pending: 0,
          "In Progress": 0,
          Resolved: 0,
          Overdue: 0,
          total: 0,
        }
      }
      if (departmentData[initialDepartmentId][status] !== undefined) {
        departmentData[initialDepartmentId][status]++
      }
      departmentData[initialDepartmentId].total++
    })

    const data = Object.keys(departmentData).map((department) => ({
      department,
      ...departmentData[department],
    }))

    // Sort by total complaints to show the most active first
    data.sort((a, b) => b.total - a.total)

    return data
  }, [complaints])

  const mostActiveDepartment = chartData.length > 0 ? chartData[0].department : null

  return (
    <div className="space-y-4">
        {mostActiveDepartment && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <span className="font-semibold text-sm">Most Active Department:</span>
                <span className="font-bold text-primary text-sm">{mostActiveDepartment}</span>
                <span className="text-sm text-muted-foreground">({chartData[0].total} complaints)</span>
            </div>
        )}
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="department"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Legend verticalAlign="top" height={40} />
            {(Object.keys(chartConfig) as (keyof typeof chartConfig)[]).map((status) => (
                <Bar
                    key={status}
                    dataKey={status}
                    stackId="a"
                    fill={chartConfig[status]?.color}
                    name={chartConfig[status]?.label}
                    radius={[4, 4, 0, 0]}
                />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
