export function formatNumber(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toLocaleString();
}

export function formatChange(pct: number): string {
	if (pct > 0) return `+${Math.round(pct)}%`;
	if (pct < 0) return `${Math.round(pct)}%`;
	return "0%";
}

export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatMonth(monthIndex: number): string {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	return months[monthIndex] ?? "";
}

export function formatHour(h: number): string {
	if (h === 0) return "12am";
	if (h < 12) return `${h}am`;
	if (h === 12) return "12pm";
	return `${h - 12}pm`;
}

export function formatDay(d: number): string {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return days[d] ?? "";
}
