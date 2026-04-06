"use client";

import type { ContributionDay } from "@/types/stats";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";

interface Props {
	years: { year: number; days: ContributionDay[] }[];
}

export function MultiYearHeatmap({ years }: Props) {
	return (
		<div className="flex flex-col gap-6">
			{years.map(({ year, days }, i) => (
				<div key={year}>
					<div className="text-xs font-semibold mb-2 text-text-secondary font-mono">
						{year}
					</div>
					<ContributionHeatmap
						days={days}
						year={year}
						showDayLabels={i === 0}
					/>
				</div>
			))}
		</div>
	);
}
