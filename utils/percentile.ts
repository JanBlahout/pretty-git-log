// Rough percentile estimates based on public GitHub data
export function commitsPercentile(commits: number): number {
	if (commits >= 2000) return 1;
	if (commits >= 1000) return 5;
	if (commits >= 500) return 15;
	if (commits >= 250) return 30;
	if (commits >= 100) return 50;
	if (commits >= 50) return 70;
	return 90;
}

export function streakPercentile(days: number): number {
	if (days >= 365) return 0.1;
	if (days >= 100) return 1;
	if (days >= 30) return 5;
	if (days >= 14) return 15;
	if (days >= 7) return 30;
	return 60;
}

export function percentileText(pct: number): string {
	if (pct <= 1) return "top 1%";
	if (pct <= 5) return "top 5%";
	if (pct <= 10) return "top 10%";
	if (pct <= 20) return "top 20%";
	return `top ${pct}%`;
}
