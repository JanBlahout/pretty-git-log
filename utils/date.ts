export function getYearRange(year: number): { start: string; end: string } {
	return {
		start: `${year}-01-01`,
		end: `${year}-12-31`,
	};
}

export function getDayOfYear(dateStr: string): number {
	const date = new Date(dateStr);
	const start = new Date(date.getFullYear(), 0, 0);
	const diff = date.getTime() - start.getTime();
	const oneDay = 1000 * 60 * 60 * 24;
	return Math.floor(diff / oneDay);
}

export function getStreaks(dates: Set<string>): {
	longest: { days: number; startDate: string; endDate: string };
	current: number;
} {
	if (dates.size === 0) {
		return { longest: { days: 0, startDate: "", endDate: "" }, current: 0 };
	}

	const sorted = Array.from(dates).sort();
	let longestStart = sorted[0]!;
	let longestEnd = sorted[0]!;
	let longestLen = 1;
	let curStart = sorted[0]!;
	let curLen = 1;

	for (let i = 1; i < sorted.length; i++) {
		const prev = new Date(sorted[i - 1]!);
		const curr = new Date(sorted[i]!);
		const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

		if (diff === 1) {
			curLen++;
			if (curLen > longestLen) {
				longestLen = curLen;
				longestStart = curStart;
				longestEnd = sorted[i]!;
			}
		} else {
			curStart = sorted[i]!;
			curLen = 1;
		}
	}

	// Current streak: count back from today
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	let current = 0;
	const check = new Date(today);
	while (true) {
		const dateStr = check.toISOString().split("T")[0]!;
		if (dates.has(dateStr)) {
			current++;
			check.setDate(check.getDate() - 1);
		} else {
			break;
		}
	}

	return {
		longest: { days: longestLen, startDate: longestStart, endDate: longestEnd },
		current,
	};
}

export function getCurrentYear(): number {
	return new Date().getFullYear();
}
