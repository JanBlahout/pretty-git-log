"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import type { TopRepo } from "@/types/stats";
import { getLanguageColor } from "@/lib/language-colors";

interface Props {
	repos: TopRepo[];
}

export function TopRepos({ repos }: Props) {
	// Use stars as metric since commit counts require extra API calls
	const data = repos.map((r) => ({
		name: r.name,
		stars: r.stars,
		language: r.language,
		description: r.description,
		fullName: r.fullName,
	}));

	return (
		<div className="space-y-4">
			<ResponsiveContainer width="100%" height={220}>
				<BarChart
					data={data}
					layout="vertical"
					margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
				>
					<XAxis
						type="number"
						tick={{
							fill: "#71717a",
							fontSize: 11,
							fontFamily: "var(--font-mono)",
						}}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						type="category"
						dataKey="name"
						width={120}
						tick={{
							fill: "#e4e4e7",
							fontSize: 12,
							fontFamily: "var(--font-mono)",
						}}
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
						formatter={(v) => [`${v} ★`]}
						cursor={{ fill: "rgba(255,255,255,0.03)" }}
					/>
					<Bar dataKey="stars" radius={[0, 4, 4, 0]}>
						{data.map((entry) => (
							<Cell key={entry.name} fill={getLanguageColor(entry.language)} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>

			<div className="grid gap-2">
				{data.map((repo) => (
					<a
						key={repo.name}
						href={`https://github.com/${repo.fullName}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-white/5 border border-border"
					>
						<div className="flex items-center gap-3">
							<span
								className="w-2.5 h-2.5 rounded-full flex-shrink-0"
								style={{ backgroundColor: getLanguageColor(repo.language) }}
							/>
							<div>
								<div className="text-text-primary text-sm font-medium">
									{repo.name}
								</div>
								{repo.description && (
									<div className="truncate max-w-xs text-text-secondary text-xs">
										{repo.description}
									</div>
								)}
							</div>
						</div>
						<div className="text-text-secondary text-[13px] font-mono shrink-0">
							★ {repo.stars.toLocaleString()}
						</div>
					</a>
				))}
			</div>
		</div>
	);
}
