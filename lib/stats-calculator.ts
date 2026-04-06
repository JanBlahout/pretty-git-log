import { cacheLife, cacheTag } from "next/cache";
import type { CodeStoryData, ContributionDay, LanguageStat } from "@/types/stats";
import { fetchUser, fetchPublicUser, fetchRepos, fetchPublicRepos, fetchPullRequests, fetchEvents, fetchRepoLanguages } from "@/lib/github";
import { fetchContributionCalendar } from "@/lib/github-graphql";
import { getStreaks } from "@/utils/date";
import { getLanguageColor } from "@/lib/language-colors";
import { generatePersonalityTags, getCodingPersonality } from "@/lib/personality";

const LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function fetchAndComputeStats(token: string, year: number): Promise<CodeStoryData> {
  "use cache";
  cacheLife("hours");
  cacheTag(`github-stats-${year}`);

  // Step 1: get user profile (need login for subsequent calls)
  const user = await fetchUser(token);
  const login = user.login;

  // Step 2: fetch all data in parallel
  const [repos, calendar, prs, events] = await Promise.all([
    fetchRepos(token),
    fetchContributionCalendar(token, login, year),
    fetchPullRequests(token, login, year),
    fetchEvents(token, login),
  ]);

  // Contribution days for this year
  const contributionDays: ContributionDay[] = calendar.weeks.flatMap((week) =>
    week.contributionDays
      .filter((d) => d.date.startsWith(String(year)))
      .map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel] ?? 0,
      }))
  );

  const activeDates = new Set(contributionDays.filter((d) => d.count > 0).map((d) => d.date));
  const { longest, current } = getStreaks(activeDates);

  // Language aggregation (top 20 repos by push date)
  const topReposByPush = repos.slice(0, 20);
  const langResults = await Promise.all(topReposByPush.map((r) => fetchRepoLanguages(token, r.full_name)));

  const langTotals: Record<string, number> = {};
  langResults.forEach((langs) => {
    Object.entries(langs).forEach(([lang, bytes]) => {
      langTotals[lang] = (langTotals[lang] ?? 0) + bytes;
    });
  });

  const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0);
  const languages: LanguageStat[] = Object.entries(langTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      color: getLanguageColor(name),
    }));

  // Time pattern analysis
  const commitsByHour = new Array<number>(24).fill(0);
  const commitsByMonth = new Array<number>(12).fill(0);
  let totalCommitsFromEvents = 0;

  // Hour data comes from PushEvents (last 90 days only — GitHub API limitation)
  for (const event of events) {
    if (event.type !== "PushEvent") continue;
    const date = new Date(event.created_at);
    if (date.getFullYear() !== year) continue;
    const count = event.payload.size ?? event.payload.commits?.length ?? 1;
    totalCommitsFromEvents += count;
    commitsByHour[date.getHours()]! += count;
    commitsByMonth[date.getMonth()]! += count;
  }

  // Day-of-week data from contribution calendar (full year, not limited to 90 days)
  const commitsByDay = new Array<number>(7).fill(0);
  for (const day of contributionDays) {
    if (day.count > 0) {
      const dow = new Date(day.date + "T12:00:00").getDay();
      commitsByDay[dow]! += day.count;
    }
  }

  // Use contribution calendar total (more accurate than events which only cover 90 days)
  const totalCommits = Math.max(totalCommitsFromEvents, calendar.totalContributions);

  // Monthly commits from contribution calendar
  const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
    const monthStr = `${year}-${String(i + 1).padStart(2, "0")}`;
    const commits = contributionDays
      .filter((d) => d.date.startsWith(monthStr))
      .reduce((sum, d) => sum + d.count, 0);
    const monthPRs = prs.filter((pr) => pr.created_at.startsWith(monthStr)).length;
    return { month: MONTH_ABBR[i]!, commits, prs: monthPRs };
  });

  const peakHour = commitsByHour.indexOf(Math.max(...commitsByHour));
  const peakDay = DAY_NAMES[commitsByDay.indexOf(Math.max(...commitsByDay))] ?? "Monday";

  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      fullName: r.full_name,
      commits: 0,
      language: r.language ?? "Unknown",
      stars: r.stargazers_count,
      description: r.description ?? "",
    }));

  const totalPRsMerged = prs.filter((pr) => pr.pull_request?.merged_at).length;

  const data: CodeStoryData = {
    login,
    name: user.name ?? login,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    year,
    totalCommits,
    totalPRs: prs.length,
    totalPRsMerged,
    totalRepos: repos.filter((r) => r.pushed_at?.startsWith(String(year))).length,
    totalStars: repos.reduce((s, r) => s + r.stargazers_count, 0),
    longestStreak: longest,
    currentStreak: current,
    totalActiveDays: activeDates.size,
    contributionDays,
    languages,
    commitsByHour,
    commitsByDay,
    commitsByMonth,
    peakHour,
    peakDay,
    codingPersonality: getCodingPersonality(peakHour),
    topRepos,
    monthlyActivity,
    personalityTags: [],
    yoyGrowth: { commitsChange: 0, prsChange: 0, reposChange: 0 },
    prevYearCommits: 0,
    prevYearPRs: 0,
    prevYearRepos: 0,
  };

  data.personalityTags = generatePersonalityTags(data);
  return data;
}

export async function fetchAndComputePublicStats(username: string, year: number): Promise<CodeStoryData> {
  "use cache";
  cacheLife("hours");
  cacheTag(`github-public-stats-${username}-${year}`);

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured");

  const login = username;

  const [user, repos, calendar, prs, events] = await Promise.all([
    fetchPublicUser(token, login),
    fetchPublicRepos(token, login),
    fetchContributionCalendar(token, login, year),
    fetchPullRequests(token, login, year),
    fetchEvents(token, login),
  ]);

  const contributionDays: ContributionDay[] = calendar.weeks.flatMap((week) =>
    week.contributionDays
      .filter((d) => d.date.startsWith(String(year)))
      .map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel] ?? 0,
      }))
  );

  const activeDates = new Set(contributionDays.filter((d) => d.count > 0).map((d) => d.date));
  const { longest, current } = getStreaks(activeDates);

  const topReposByPush = repos.slice(0, 20);
  const langResults = await Promise.all(topReposByPush.map((r) => fetchRepoLanguages(token, r.full_name)));

  const langTotals: Record<string, number> = {};
  langResults.forEach((langs) => {
    Object.entries(langs).forEach(([lang, bytes]) => {
      langTotals[lang] = (langTotals[lang] ?? 0) + bytes;
    });
  });

  const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0);
  const languages: LanguageStat[] = Object.entries(langTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      color: getLanguageColor(name),
    }));

  const commitsByHour = new Array<number>(24).fill(0);
  const commitsByMonth = new Array<number>(12).fill(0);
  let totalCommitsFromEvents = 0;

  for (const event of events) {
    if (event.type !== "PushEvent") continue;
    const date = new Date(event.created_at);
    if (date.getFullYear() !== year) continue;
    const count = event.payload.size ?? event.payload.commits?.length ?? 1;
    totalCommitsFromEvents += count;
    commitsByHour[date.getHours()]! += count;
    commitsByMonth[date.getMonth()]! += count;
  }

  const commitsByDay = new Array<number>(7).fill(0);
  for (const day of contributionDays) {
    if (day.count > 0) {
      const dow = new Date(day.date + "T12:00:00").getDay();
      commitsByDay[dow]! += day.count;
    }
  }

  const totalCommits = Math.max(totalCommitsFromEvents, calendar.totalContributions);

  const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
    const monthStr = `${year}-${String(i + 1).padStart(2, "0")}`;
    const commits = contributionDays
      .filter((d) => d.date.startsWith(monthStr))
      .reduce((sum, d) => sum + d.count, 0);
    const monthPRs = prs.filter((pr) => pr.created_at.startsWith(monthStr)).length;
    return { month: MONTH_ABBR[i]!, commits, prs: monthPRs };
  });

  const peakHour = commitsByHour.indexOf(Math.max(...commitsByHour));
  const peakDay = DAY_NAMES[commitsByDay.indexOf(Math.max(...commitsByDay))] ?? "Monday";

  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      fullName: r.full_name,
      commits: 0,
      language: r.language ?? "Unknown",
      stars: r.stargazers_count,
      description: r.description ?? "",
    }));

  const totalPRsMerged = prs.filter((pr) => pr.pull_request?.merged_at).length;

  const data: CodeStoryData = {
    login,
    name: user.name ?? login,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    year,
    totalCommits,
    totalPRs: prs.length,
    totalPRsMerged,
    totalRepos: repos.filter((r) => r.pushed_at?.startsWith(String(year))).length,
    totalStars: repos.reduce((s, r) => s + r.stargazers_count, 0),
    longestStreak: longest,
    currentStreak: current,
    totalActiveDays: activeDates.size,
    contributionDays,
    languages,
    commitsByHour,
    commitsByDay,
    commitsByMonth,
    peakHour,
    peakDay,
    codingPersonality: getCodingPersonality(peakHour),
    topRepos,
    monthlyActivity,
    personalityTags: [],
    yoyGrowth: { commitsChange: 0, prsChange: 0, reposChange: 0 },
    prevYearCommits: 0,
    prevYearPRs: 0,
    prevYearRepos: 0,
  };

  data.personalityTags = generatePersonalityTags(data);
  return data;
}
