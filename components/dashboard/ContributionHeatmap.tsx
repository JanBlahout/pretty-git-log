"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ContributionDay } from "@/types/stats";

const COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const CELL = 12;
const GAP = 3;
const ROWS = 7;

interface Props {
  days: ContributionDay[];
  year: number;
  showDayLabels?: boolean;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export function ContributionHeatmap({ days, year, showDayLabels = true }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const byDate = Object.fromEntries(days.map((d) => [d.date, d]));

  const startDate = new Date(`${year}-01-01`);
  const startDow = startDate.getDay();

  const cells: (ContributionDay | null)[] = Array(startDow).fill(null);
  const endDate = new Date(`${year}-12-31`);
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const iso = cur.toISOString().split("T")[0]!;
    cells.push(byDate[iso] ?? { date: iso, count: 0, level: 0 });
    cur.setDate(cur.getDate() + 1);
  }

  const cols: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    cols.push(cells.slice(i, i + 7));
  }

  const monthLabels: { label: string; col: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const first = new Date(year, m, 1);
    const dayOfYear = Math.floor((first.getTime() - startDate.getTime()) / 86400000) + startDow;
    monthLabels.push({
      label: first.toLocaleDateString("en-US", { month: "short" }),
      col: Math.floor(dayOfYear / 7),
    });
  }

  const totalWidth = cols.length * (CELL + GAP);

  return (
    <div className="relative overflow-x-auto">
      <div className="inline-block pl-8">
        {/* Month labels */}
        <div className="relative h-5 mb-1" style={{ width: totalWidth }}>
          {monthLabels.map(({ label, col }) => (
            <span
              key={label}
              className="absolute text-[11px] text-text-secondary font-mono"
              style={{
                left: col * (CELL + GAP),
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex relative" style={{ gap: GAP }}>
          {/* Day labels */}
          <div
            className="absolute -left-8 top-0 flex flex-col"
            style={{ gap: GAP }}
          >
            {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
              <div key={i} className="text-[10px] text-text-secondary font-mono" style={{ height: CELL, lineHeight: `${CELL}px` }}>
                {showDayLabels ? label : ""}
              </div>
            ))}
          </div>

          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col" style={{ gap: GAP }}>
              {Array.from({ length: ROWS }).map((_, ri) => {
                const day = col[ri] ?? null;
                return (
                  <motion.div
                    key={ri}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      backgroundColor: day ? COLORS[day.level] : "transparent",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: ci * 0.008, duration: 0.25 }}
                    onMouseEnter={(e) => {
                      if (!day || day.count === 0) return;
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      setTooltip({
                        text: `${day.count} on ${new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                        x: rect.left + CELL / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed -translate-x-1/2 -translate-y-full bg-surface-2 border border-border text-text-primary text-[12px] px-[10px] py-1 rounded-lg z-50 whitespace-nowrap pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
