export interface GitHubUser {
	login: string;
	name: string;
	avatar_url: string;
	created_at: string;
	public_repos: number;
	followers: number;
}

export interface GitHubRepo {
	name: string;
	full_name: string;
	language: string | null;
	stargazers_count: number;
	pushed_at: string;
	fork: boolean;
	description: string | null;
	private: boolean;
}

export interface GitHubPR {
	title: string;
	created_at: string;
	merged_at: string | null;
	repository_url: string;
	state: string;
	pull_request?: { merged_at: string | null };
}

export interface GitHubEvent {
	type: string;
	created_at: string;
	repo: { name: string };
	payload: {
		commits?: Array<{ sha: string; message: string }>;
		action?: string;
		size?: number;
	};
}

export interface ContributionCalendarDay {
	date: string;
	contributionCount: number;
	contributionLevel:
		| "NONE"
		| "FIRST_QUARTILE"
		| "SECOND_QUARTILE"
		| "THIRD_QUARTILE"
		| "FOURTH_QUARTILE";
}

export interface ContributionCalendar {
	totalContributions: number;
	weeks: Array<{
		contributionDays: ContributionCalendarDay[];
	}>;
}

export interface CommitActivity {
	week: number;
	total: number;
	days: number[];
}
