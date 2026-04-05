"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import type { LanguageStat } from "@/types/stats";

interface Props {
  languages: LanguageStat[];
  totalRepos: number;
}

export function LanguageBreakdown({ languages, totalRepos }: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      {/* Horizontal bars */}
      <div className="flex-1 space-y-3">
        {languages.map((lang, i) => (
          <motion.div
            key={lang.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "#e4e4e7", fontFamily: "var(--font-mono)" }}>
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: lang.color }} />
                {lang.name}
              </span>
              <span style={{ color: "#71717a", fontFamily: "var(--font-mono)" }}>{lang.percentage}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#2a2a2e" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: lang.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${lang.percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Donut chart */}
      <div className="relative flex-shrink-0" style={{ width: 200, height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={languages}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="percentage"
              paddingAngle={2}
            >
              {languages.map((lang) => (
                <Cell key={lang.name} fill={lang.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`${v}%`]}
              contentStyle={{
                backgroundColor: "#1c1c1f",
                border: "1px solid #2a2a2e",
                borderRadius: 8,
                fontSize: 12,
                color: "#e4e4e7",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "#e4e4e7" }}>
            {totalRepos}
          </div>
          <div style={{ fontSize: 11, color: "#71717a" }}>repos</div>
        </div>
      </div>
    </div>
  );
}
