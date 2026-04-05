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
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export function ContributionHeatmap({ days, year }: Props) {
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
    <div style={{ position: "relative", overflowX: "auto" }}>
      <div style={{ display: "inline-block", paddingLeft: 32 }}>
        {/* Month labels */}
        <div style={{ position: "relative", height: 20, width: totalWidth, marginBottom: 4 }}>
          {monthLabels.map(({ label, col }) => (
            <span
              key={label}
              style={{
                position: "absolute",
                left: col * (CELL + GAP),
                fontSize: 11,
                color: "#71717a",
                fontFamily: "var(--font-mono)",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: GAP, position: "relative" }}>
          {/* Day labels */}
          <div
            style={{
              position: "absolute",
              left: -32,
              top: 0,
              display: "flex",
              flexDirection: "column",
              gap: GAP,
            }}
          >
            {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
              <div key={i} style={{ height: CELL, fontSize: 10, color: "#71717a", lineHeight: `${CELL}px`, fontFamily: "var(--font-mono)" }}>
                {label}
              </div>
            ))}
          </div>

          {cols.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
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
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#1c1c1f",
            border: "1px solid #2a2a2e",
            color: "#e4e4e7",
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 8,
            zIndex: 50,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
