"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CodeStoryData } from "@/types/stats";

interface Props {
  usernames: string[];
  colors: string[];
  dataByUser: Record<string, Record<number, CodeStoryData>>;
  activeYear: number | "all";
  availableYears: number[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CompareChart({ usernames, colors, dataByUser, activeYear, availableYears }: Props) {
  if (activeYear !== "all") {
    // Monthly commits line chart for selected year
    const chartData = MONTHS.map((month) => {
      const row: Record<string, string | number> = { month };
      for (const username of usernames) {
        const d = dataByUser[username]?.[activeYear];
        row[username] = d?.monthlyActivity.find((m) => m.month === month)?.commits ?? 0;
      }
      return row;
    });

    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
            contentStyle={{ backgroundColor: "#1c1c1f", border: "1px solid #2a2a2e", borderRadius: 10, fontSize: 13 }}
            cursor={{ stroke: "#2a2a2e" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)", paddingTop: 12 }}
          />
          {usernames.map((username, i) => (
            <Line
              key={username}
              type="monotone"
              dataKey={username}
              stroke={colors[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // All-time: bar chart of annual commits per user per year
  const fetchedYears = availableYears
    .filter((y) => usernames.some((u) => dataByUser[u]?.[y]))
    .sort((a, b) => a - b);

  const chartData = fetchedYears.map((year) => {
    const row: Record<string, string | number> = { year: String(year) };
    for (const username of usernames) {
      row[username] = dataByUser[username]?.[year]?.totalCommits ?? 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" vertical={false} />
        <XAxis
          dataKey="year"
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
          contentStyle={{ backgroundColor: "#1c1c1f", border: "1px solid #2a2a2e", borderRadius: 10, fontSize: 13 }}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)", paddingTop: 12 }}
        />
        {usernames.map((username, i) => (
          <Bar key={username} dataKey={username} fill={colors[i]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
