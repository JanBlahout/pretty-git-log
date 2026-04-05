import type { CodeStoryData } from "@/types/stats";

export function generatePersonalityTags(data: CodeStoryData): string[] {
  const tags: string[] = [];

  // Time-based
  if (data.peakHour >= 22 || data.peakHour <= 4) tags.push("Night owl");
  else if (data.peakHour >= 5 && data.peakHour <= 8) tags.push("Early bird");
  else if (data.peakHour >= 9 && data.peakHour <= 17) tags.push("9-to-5 coder");

  // Streak-based
  if (data.longestStreak.days >= 100) tags.push("Unstoppable");
  else if (data.longestStreak.days >= 30) tags.push("Streak machine");

  // Language-based
  const topLang = data.languages[0];
  if (topLang) {
    if (topLang.percentage >= 60) tags.push(`${topLang.name} purist`);
    else if (data.languages.length >= 5) tags.push("Polyglot coder");
  }

  // Volume-based
  if (data.totalCommits >= 1000) tags.push("Commit machine");
  else if (data.totalPRs >= 100) tags.push("PR powerhouse");
  if (data.totalActiveDays >= 300) tags.push("Every-day coder");

  // Pattern-based
  const weekendCommits = (data.commitsByDay[0] ?? 0) + (data.commitsByDay[6] ?? 0);
  const weekdayCommits = data.commitsByDay.slice(1, 6).reduce((a, b) => a + b, 0);
  if (weekendCommits > weekdayCommits * 0.4) tags.push("Weekend warrior");

  // PR quality
  if (data.totalPRs > 0 && data.totalPRsMerged / data.totalPRs >= 0.9) {
    tags.push("PR perfectionist");
  }

  // Fullstack
  const langNames = data.languages.map((l) => l.name.toLowerCase());
  const hasFrontend = langNames.some((l) => ["typescript", "javascript", "css", "html", "vue", "svelte"].includes(l));
  const hasBackend = langNames.some((l) => ["python", "go", "rust", "java", "ruby", "sql", "php", "c#", "kotlin"].includes(l));
  if (hasFrontend && hasBackend) tags.push("Full-stack builder");

  return tags.slice(0, 5);
}

export function generateNarrative(data: CodeStoryData): string {
  const peakMonthIdx = data.commitsByMonth.indexOf(Math.max(...data.commitsByMonth));
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const peakMonth = months[peakMonthIdx] ?? "a busy month";

  const avgPRSize = data.totalPRs > 0 ? Math.round(data.totalCommits / data.totalPRs) : 0;
  const prSizeText = avgPRSize < 3 ? "small, focused" : avgPRSize < 8 ? "medium-sized" : "large";

  const lines = [
    `${data.year === 0 ? "All time" : `In ${data.year}`}, you made ${data.totalCommits.toLocaleString()} commits across ${data.totalRepos} repositories.`,
    `Your longest streak was ${data.longestStreak.days} days straight — your most productive month was ${peakMonth}.`,
  ];

  if (data.totalPRs > 0) {
    lines.push(`You opened ${data.totalPRs} pull requests and favored ${prSizeText} PRs.`);
  }

  return lines.join(" ");
}

export function getCodingPersonality(peakHour: number): string {
  if (peakHour >= 22 || peakHour <= 4) return "Night owl";
  if (peakHour >= 5 && peakHour <= 8) return "Early bird";
  if (peakHour >= 9 && peakHour <= 17) return "9-to-5er";
  return "Evening coder";
}
