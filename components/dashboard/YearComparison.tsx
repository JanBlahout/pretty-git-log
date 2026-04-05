"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { formatChange } from "@/utils/format";

interface Props {
  year: number;
  current: { commits: number; prs: number; repos: number };
  prev: { commits: number; prs: number; repos: number };
}

export function YearComparison({ year, current, prev }: Props) {
  const metrics = [
    { label: "Commits", cur: current.commits, prv: prev.commits },
    { label: "PRs", cur: current.prs, prv: prev.prs },
    { label: "Repos", cur: current.repos, prv: prev.repos },
  ];

  const data = metrics.map((m) => ({
    name: m.label,
    [String(year - 1)]: m.prv,
    [String(year)]: m.cur,
    change: m.prv > 0 ? ((m.cur - m.prv) / m.prv) * 100 : 0,
  }));

  if (prev.commits === 0 && prev.prs === 0 && prev.repos === 0) {
    return (
      <div className="flex items-center justify-center py-12" style={{ color: "#71717a" }}>
        Year-over-year data will be available after your second year on GitHub.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#71717a", fontSize: 13, fontFamily: "var(--font-mono)" }}
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
              borderRadius: 8,
              fontSize: 12,
              color: "#e4e4e7",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey={String(year - 1)} fill="#2a2a2e" radius={[4, 4, 0, 0]} name={String(year - 1)} />
          <Bar dataKey={String(year)} fill="#8b5cf6" radius={[4, 4, 0, 0]} name={String(year)}>
            <LabelList
              dataKey="change"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => formatChange(Number(v))}
              style={{ fontSize: 11, fill: "#a78bfa" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 justify-center text-sm" style={{ color: "#71717a" }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: "#2a2a2e", display: "inline-block" }} />
          {year - 1}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: "#8b5cf6", display: "inline-block" }} />
          {year}
        </span>
      </div>
    </div>
  );
}
