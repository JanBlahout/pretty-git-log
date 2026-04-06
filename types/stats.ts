export interface ContributionDay {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

export interface LanguageStat {
	name: string;
	bytes: number;
	percentage: number;
	color: string;
}

export interface TopRepo {
	name: string;
	fullName: string;
	commits: number;
	language: string;
	stars: number;
	description: string;
}

export interface MonthlyActivity {
	month: string;
	commits: number;
	prs: number;
}

export interface Streak {
	days: number;
	startDate: string;
	endDate: string;
}

export interface CodeStoryData {
	// Profile
	login: string;
	name: string;
	avatarUrl: string;
	createdAt: string;
	year: number;

	// Overview stats
	totalCommits: number;
	totalPRs: number;
	totalPRsMerged: number;
	totalRepos: number;
	totalStars: number;

	// Streaks
	longestStreak: Streak;
	currentStreak: number;
	totalActiveDays: number;

	// Contribution heatmap (365 days)
	contributionDays: ContributionDay[];

	// Language breakdown
	languages: LanguageStat[];

	// Time patterns
	commitsByHour: number[];
	commitsByDay: number[];
	commitsByMonth: number[];
	peakHour: number;
	peakDay: string;
	codingPersonality: string;

	// Top repos
	topRepos: TopRepo[];

	// Monthly activity
	monthlyActivity: MonthlyActivity[];

	// Personality tags
	personalityTags: string[];

	// Year-over-year
	yoyGrowth: {
		commitsChange: number;
		prsChange: number;
		reposChange: number;
	};

	// Previous year data for comparison
	prevYearCommits: number;
	prevYearPRs: number;
	prevYearRepos: number;
}
