import type {
	GitHubUser,
	GitHubRepo,
	GitHubPR,
	GitHubEvent,
	CommitActivity,
} from "@/types/github";

const BASE = "https://api.github.com";

async function ghFetch<T>(path: string, token: string): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});

	if (!res.ok) {
		throw new Error(`GitHub API ${path} → ${res.status} ${res.statusText}`);
	}
	return res.json() as Promise<T>;
}

async function ghFetchPaginated<T>(
	path: string,
	token: string,
	maxPages = 10,
): Promise<T[]> {
	const results: T[] = [];
	let page = 1;

	while (page <= maxPages) {
		const sep = path.includes("?") ? "&" : "?";
		const data = await ghFetch<T[]>(
			`${path}${sep}per_page=100&page=${page}`,
			token,
		);
		if (!Array.isArray(data) || data.length === 0) break;
		results.push(...data);
		if (data.length < 100) break;
		page++;
	}

	return results;
}

export async function fetchUser(token: string): Promise<GitHubUser> {
	return ghFetch<GitHubUser>("/user", token);
}

export async function fetchPublicUser(
	token: string,
	username: string,
): Promise<GitHubUser> {
	return ghFetch<GitHubUser>(`/users/${username}`, token);
}

export async function fetchRepos(token: string): Promise<GitHubRepo[]> {
	const repos = await ghFetchPaginated<GitHubRepo>(
		"/user/repos?sort=pushed&type=all",
		token,
		5,
	);
	return repos.filter((r) => !r.fork).slice(0, 50);
}

export async function fetchPublicRepos(
	token: string,
	username: string,
): Promise<GitHubRepo[]> {
	const repos = await ghFetchPaginated<GitHubRepo>(
		`/users/${username}/repos?sort=pushed`,
		token,
		5,
	);
	return repos.filter((r) => !r.fork).slice(0, 50);
}

export async function fetchPullRequests(
	token: string,
	login: string,
	year: number,
): Promise<GitHubPR[]> {
	const q = encodeURIComponent(
		`author:${login} type:pr created:${year}-01-01..${year}-12-31`,
	);
	const data = await ghFetch<{ items: GitHubPR[] }>(
		`/search/issues?q=${q}&per_page=100`,
		token,
	);
	return data.items;
}

export async function fetchEvents(
	token: string,
	login: string,
): Promise<GitHubEvent[]> {
	return ghFetchPaginated<GitHubEvent>(`/users/${login}/events`, token, 3);
}

export async function fetchRepoLanguages(
	token: string,
	fullName: string,
): Promise<Record<string, number>> {
	try {
		return await ghFetch<Record<string, number>>(
			`/repos/${fullName}/languages`,
			token,
		);
	} catch {
		return {};
	}
}

export async function fetchCommitActivity(
	token: string,
	fullName: string,
): Promise<CommitActivity[]> {
	try {
		const data = await ghFetch<CommitActivity[]>(
			`/repos/${fullName}/stats/commit_activity`,
			token,
		);
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}
