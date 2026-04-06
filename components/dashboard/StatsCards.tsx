"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatNumber } from "@/utils/format";

interface Stat {
  label: string;
  value: number;
  formatter?: (n: number) => string;
  sub?: string;
  subColor?: string;
}

interface Props {
  stats: Stat[];
}

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <ScrollReveal key={stat.label} delay={i * 0.1}>
          <div className="rounded-2xl p-6 bg-surface border border-border">
            <div className="font-mono text-text-primary">
              <AnimatedNumber
                value={stat.value}
                formatter={stat.formatter ?? formatNumber}
                className="block text-4xl font-bold mb-1"
              />
            </div>
            <div className="text-sm mt-1 text-text-secondary">{stat.label}</div>
            {stat.sub && (
              <div className="text-xs mt-1" style={{ color: stat.subColor ?? "#8b5cf6" }}>
                {stat.sub}
              </div>
            )}
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
