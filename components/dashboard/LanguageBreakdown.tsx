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
							<span className="text-text-primary font-mono">
								<span
									className="inline-block w-2.5 h-2.5 rounded-full mr-2"
									style={{ backgroundColor: lang.color }}
								/>
								{lang.name}
							</span>
							<span className="text-text-secondary font-mono">
								{lang.percentage}%
							</span>
						</div>
						<div className="h-2 rounded-full overflow-hidden bg-border">
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
			<div className="relative flex-shrink-0 w-[200px] h-[200px]">
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
				<div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
					<div className="font-mono text-2xl font-bold text-text-primary">
						{totalRepos}
					</div>
					<div className="text-[11px] text-text-secondary">repos</div>
				</div>
			</div>
		</div>
	);
}
