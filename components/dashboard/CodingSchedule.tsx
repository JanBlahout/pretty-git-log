"use client";

import { motion } from "framer-motion";
import { formatHour } from "@/utils/format";

interface Props {
  commitsByHour: number[];
  commitsByDay: number[];
  peakHour: number;
  codingPersonality: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_BLOCKS = [0, 3, 6, 9, 12, 15, 18, 21]; // 8 x 3-hour blocks

export function CodingSchedule({ commitsByHour, commitsByDay, peakHour, codingPersonality }: Props) {
  // Aggregate into 3-hour blocks × 7 days
  // Since we don't have hour×day breakdown, we'll approximate using hour totals and day totals
  const hourBlocks = HOUR_BLOCKS.map((h) => {
    const total = commitsByHour.slice(h, h + 3).reduce((a, b) => a + b, 0);
    return { hour: h, total };
  });

  const maxHourBlock = Math.max(...hourBlocks.map((b) => b.total), 1);
  const maxDayCommit = Math.max(...commitsByDay, 1);

  const CELL = 36;
  const GAP = 4;

  return (
    <div className="space-y-8">
      {/* Hour × Day grid */}
      <div>
        <div className="flex gap-1 items-end mb-3">
          <div style={{ width: 40 }} />
          {DAYS.map((d) => (
            <div key={d} style={{ width: CELL, textAlign: "center", fontSize: 12, color: "#71717a", fontFamily: "var(--font-mono)" }}>
              {d}
            </div>
          ))}
        </div>

        {hourBlocks.map(({ hour, total }, hi) => {
          const intensity = total / maxHourBlock;
          return (
            <div key={hour} className="flex gap-1 items-center mb-1">
              <div style={{ width: 40, fontSize: 11, color: "#71717a", fontFamily: "var(--font-mono)", textAlign: "right", paddingRight: 8 }}>
                {formatHour(hour)}
              </div>
              {DAYS.map((d, di) => {
                const dayFactor = (commitsByDay[di] ?? 0) / maxDayCommit;
                const combinedIntensity = intensity * 0.6 + dayFactor * 0.4;
                const alpha = Math.min(combinedIntensity, 1);
                return (
                  <motion.div
                    key={d}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 6,
                      backgroundColor: `rgba(139,92,246,${alpha.toFixed(2)})`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (hi * 7 + di) * 0.005, duration: 0.3 }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{ backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
      >
        <div className="text-3xl">
          {peakHour >= 22 || peakHour <= 4 ? "🦉" : peakHour <= 8 ? "🌅" : peakHour <= 17 ? "💼" : "🌙"}
        </div>
        <div>
          <div style={{ color: "#e4e4e7", fontWeight: 600 }}>{codingPersonality}</div>
          <div style={{ color: "#71717a", fontSize: 14 }}>
            Most active around {formatHour(peakHour)}
          </div>
        </div>
      </div>
    </div>
  );
}
