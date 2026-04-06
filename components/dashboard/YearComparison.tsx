"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	LabelList,
} from "recharts";
import { formatChange } from "@/utils/format";

interface Props {
	year: number;
	current: { commits: number; prs: number; repos: number };
	prev: { commits: number; prs: number; repos: number };
}

function CustomTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: { name: string; value: number; fill: string }[];
	label?: string;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-border border border-border-strong rounded-lg text-xs px-3 py-2">
			<p className="text-text-primary mb-1.5 font-semibold">{label}</p>
			{payload.map((item) => (
				<p
					key={item.name}
					className="my-0.5"
					style={{ color: item.fill === "#8b5cf6" ? "#a78bfa" : "#a1a1aa" }}
				>
					{item.name}: {item.value}
				</p>
			))}
		</div>
	);
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
			<div className="flex items-center justify-center py-12 text-text-secondary">
				Year-over-year data will be available after your second year on GitHub.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<ResponsiveContainer width="100%" height={240}>
				<BarChart
					data={data}
					margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
				>
					<XAxis
						dataKey="name"
						tick={{
							fill: "#71717a",
							fontSize: 13,
							fontFamily: "var(--font-mono)",
						}}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						tick={{
							fill: "#71717a",
							fontSize: 11,
							fontFamily: "var(--font-mono)",
						}}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						content={<CustomTooltip />}
						cursor={{ fill: "rgba(255,255,255,0.05)" }}
					/>
					<Bar
						dataKey={String(year - 1)}
						fill="#2a2a2e"
						radius={[4, 4, 0, 0]}
						name={String(year - 1)}
					/>
					<Bar
						dataKey={String(year)}
						fill="#8b5cf6"
						radius={[4, 4, 0, 0]}
						name={String(year)}
					>
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

			<div className="flex gap-4 justify-center text-sm text-text-secondary">
				<span className="flex items-center gap-1.5">
					<span className="w-3 h-3 rounded inline-block bg-border" />
					{year - 1}
				</span>
				<span className="flex items-center gap-1.5">
					<span className="w-3 h-3 rounded inline-block bg-brand" />
					{year}
				</span>
			</div>
		</div>
	);
}
