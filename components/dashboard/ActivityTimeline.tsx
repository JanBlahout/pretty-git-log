"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyActivity } from "@/types/stats";

interface Props {
  data: MonthlyActivity[];
}

export function ActivityTimeline({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#71717a", fontSize: 12, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1c1c1f",
            border: "1px solid #2a2a2e",
            borderRadius: 10,
            color: "#e4e4e7",
            fontSize: 13,
          }}
          cursor={{ stroke: "#2a2a2e" }}
        />
        <Area
          type="monotone"
          dataKey="commits"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#colorCommits)"
          name="Commits"
        />
        <Area
          type="monotone"
          dataKey="prs"
          stroke="#06b6d4"
          strokeWidth={2}
          fill="url(#colorPRs)"
          name="PRs"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
