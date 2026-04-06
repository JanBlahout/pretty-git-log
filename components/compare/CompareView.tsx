"use client";

import { useState } from "react";
import Image from "next/image";
import type { CodeStoryData } from "@/types/stats";
import { fetchPublicYearStats } from "@/app/actions";
import { CompareChart } from "./CompareChart";

const USER_COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b"];

interface Props {
  usernames: string[];
  initialData: Record<string, CodeStoryData>;
  currentYear: number;
}

interface DisplayStats {
  totalCommits: number;
  totalPRs: number;
  totalPRsMerged: number;
  totalActiveDays: number;
  longestStreak: number;
  totalRepos: number;
  totalStars: number;
  topLanguage: string;
}

function getYearStats(data: CodeStoryData): DisplayStats {
  return {
    totalCommits: data.totalCommits,
    totalPRs: data.totalPRs,
    totalPRsMerged: data.totalPRsMerged,
    totalActiveDays: data.totalActiveDays,
    longestStreak: data.longestStreak.days,
    totalRepos: data.totalRepos,
    totalStars: data.totalStars,
    topLanguage: data.languages[0]?.name ?? "—",
  };
}

function aggregateStats(yearDataList: CodeStoryData[]): DisplayStats {
  const latest = yearDataList[0]!;
  return {
    totalCommits: yearDataList.reduce((s, d) => s + d.totalCommits, 0),
    totalPRs: yearDataList.reduce((s, d) => s + d.totalPRs, 0),
    totalPRsMerged: yearDataList.reduce((s, d) => s + d.totalPRsMerged, 0),
    totalActiveDays: yearDataList.reduce((s, d) => s + d.totalActiveDays, 0),
    longestStreak: Math.max(...yearDataList.map((d) => d.longestStreak.days)),
    totalRepos: Math.max(...yearDataList.map((d) => d.totalRepos)),
    totalStars: latest.totalStars,
    topLanguage: latest.languages[0]?.name ?? "—",
  };
}

const STAT_ROWS: { key: keyof DisplayStats; label: string; format?: (v: number | string) => string; numeric: boolean }[] = [
  { key: "totalCommits", label: "Commits", numeric: true },
  { key: "totalPRs", label: "Pull requests", numeric: true },
  { key: "totalPRsMerged", label: "PRs merged", numeric: true },
  { key: "totalActiveDays", label: "Active days", numeric: true },
  { key: "longestStreak", label: "Longest streak", format: (v) => `${v}d`, numeric: true },
  { key: "totalRepos", label: "Active repos", numeric: true },
  { key: "totalStars", label: "Total stars", numeric: true },
  { key: "topLanguage", label: "Top language", numeric: false },
];

export function CompareView({ usernames, initialData, currentYear }: Props) {
  const [dataByUser, setDataByUser] = useState<Record<string, Record<number, CodeStoryData>>>(
    () => Object.fromEntries(usernames.map((u) => [u, initialData[u] ? { [currentYear]: initialData[u]! } : {}]))
  );
  const [activeYear, setActiveYear] = useState<number | "all">(currentYear);
  const [loading, setLoading] = useState(false);

  // Union of all years from all users' join dates
  const joinYears = usernames.map((u) => {
    const data = Object.values(dataByUser[u] ?? {})[0];
    return data ? new Date(data.createdAt).getFullYear() : currentYear;
  });
  const minJoinYear = Math.min(...joinYears);
  const availableYears: number[] = [];
  for (let y = currentYear; y >= minJoinYear; y--) availableYears.push(y);

  const handleYearChange = async (year: number | "all") => {
    setActiveYear(year);

    const yearsToFetch: { username: string; year: number }[] = [];

    if (year === "all") {
      for (const username of usernames) {
        const joinYear = joinYears[usernames.indexOf(username)]!;
        for (let y = currentYear; y >= joinYear; y--) {
          if (!dataByUser[username]?.[y]) {
            yearsToFetch.push({ username, year: y });
          }
        }
      }
    } else {
      for (const username of usernames) {
        if (!dataByUser[username]?.[year]) {
          const joinYear = joinYears[usernames.indexOf(username)]!;
          if (year >= joinYear) {
            yearsToFetch.push({ username, year });
          }
        }
      }
    }

    if (yearsToFetch.length === 0) return;

    setLoading(true);
    try {
      const results = await Promise.allSettled(
        yearsToFetch.map(({ username, year: y }) => fetchPublicYearStats(username, y))
      );
      setDataByUser((prev) => {
        const next = { ...prev };
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            const { username, year: y } = yearsToFetch[i]!;
            next[username] = { ...next[username], [y]: result.value };
          }
        });
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  // Compute display stats per user for the active year
  const statsPerUser: Record<string, DisplayStats | null> = {};
  for (const username of usernames) {
    const joinYear = joinYears[usernames.indexOf(username)]!;
    if (activeYear !== "all" && activeYear < joinYear) {
      statsPerUser[username] = null; // joined after this year
      continue;
    }
    if (activeYear === "all") {
      const allYearData = Object.values(dataByUser[username] ?? {});
      statsPerUser[username] = allYearData.length > 0 ? aggregateStats(allYearData) : null;
    } else {
      const d = dataByUser[username]?.[activeYear];
      statsPerUser[username] = d ? getYearStats(d) : null;
    }
  }

  // Find winner per numeric stat
  const winners: Record<keyof DisplayStats, string | null> = {} as Record<keyof DisplayStats, string | null>;
  for (const row of STAT_ROWS) {
    if (!row.numeric) { winners[row.key] = null; continue; }
    let best = -1;
    let bestUser: string | null = null;
    let tie = false;
    for (const username of usernames) {
      const val = statsPerUser[username]?.[row.key];
      if (typeof val !== "number") continue;
      if (val > best) { best = val; bestUser = username; tie = false; }
      else if (val === best) tie = true;
    }
    winners[row.key] = tie ? null : bestUser;
  }

  // Get representative data for header (first available year for each user)
  const headerData = (username: string) =>
    Object.values(dataByUser[username] ?? {})[0] ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-background/85 backdrop-blur-md border-b border-border">
        <a href="/" className="font-mono font-bold text-text-primary hover:opacity-80 transition-opacity">
          Code<span className="text-brand">Story</span>
        </a>
        <span className="text-text-secondary text-sm font-mono">compare</span>
      </nav>

      {/* Header */}
      <div
        className="pt-24 pb-10 px-6"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 70%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold font-mono text-text-primary mb-8">Developer comparison</h1>
          <div className="flex flex-wrap gap-6">
            {usernames.map((username, i) => {
              const d = headerData(username);
              const color = USER_COLORS[i]!;
              return (
                <div key={username} className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full opacity-30 blur-[12px]" style={{ backgroundColor: color }} />
                    {d ? (
                      <Image
                        src={d.avatarUrl}
                        alt={username}
                        width={48}
                        height={48}
                        className="relative rounded-full border-2"
                        style={{ borderColor: color }}
                      />
                    ) : (
                      <div
                        className="relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-mono"
                        style={{ borderColor: color, color, backgroundColor: `${color}20` }}
                      >
                        {username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-sm" style={{ color }}>
                      @{d?.login ?? username}
                    </div>
                    {d && (
                      <div className="text-xs text-text-muted">
                        {d.name !== d.login ? d.name : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-5">
        {/* Year tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleYearChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-colors cursor-pointer border ${
              activeYear === "all"
                ? "bg-brand text-white border-brand"
                : "bg-surface text-text-secondary border-border hover:border-text-muted"
            }`}
          >
            All time
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-colors cursor-pointer border ${
                activeYear === year
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-text-secondary border-border hover:border-text-muted"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4 text-text-muted text-sm font-mono">Loading...</div>
        )}

        {/* Stats comparison */}
        <div className="rounded-2xl bg-surface border border-border overflow-hidden">
          {/* Column headers */}
          <div
            className="grid border-b border-border"
            style={{ gridTemplateColumns: `1fr repeat(${usernames.length}, 1fr)` }}
          >
            <div className="p-4" />
            {usernames.map((username, i) => (
              <div key={username} className="p-4 text-center">
                <span className="font-mono text-sm font-semibold" style={{ color: USER_COLORS[i] }}>
                  @{username}
                </span>
              </div>
            ))}
          </div>

          {/* Stat rows */}
          {STAT_ROWS.map((row, rowIdx) => (
            <div
              key={row.key}
              className={`grid ${rowIdx < STAT_ROWS.length - 1 ? "border-b border-border" : ""}`}
              style={{ gridTemplateColumns: `1fr repeat(${usernames.length}, 1fr)` }}
            >
              <div className="p-4 text-sm text-text-secondary font-mono flex items-center">
                {row.label}
              </div>
              {usernames.map((username, i) => {
                const stats = statsPerUser[username];
                const color = USER_COLORS[i]!;
                const isWinner = winners[row.key] === username;

                if (stats === null) {
                  return (
                    <div key={username} className="p-4 text-center flex items-center justify-center">
                      <span className="text-text-muted text-sm font-mono">—</span>
                    </div>
                  );
                }

                const raw = stats[row.key];
                const display = row.format && typeof raw === "number"
                  ? row.format(raw)
                  : typeof raw === "number"
                  ? raw.toLocaleString()
                  : raw;

                return (
                  <div key={username} className="p-4 text-center flex items-center justify-center">
                    <span
                      className={`font-mono font-semibold text-base ${isWinner ? "text-lg" : ""}`}
                      style={{ color: isWinner ? color : "#e4e4e7" }}
                    >
                      {display}
                      {isWinner && <span className="ml-1 text-xs">★</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Commits over time chart */}
        <div className="rounded-2xl p-8 bg-surface border border-border">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6 text-text-secondary font-mono">
            {activeYear === "all" ? "Annual commits" : `Monthly commits — ${activeYear}`}
          </h2>
          <CompareChart
            usernames={usernames}
            colors={USER_COLORS.slice(0, usernames.length)}
            dataByUser={dataByUser}
            activeYear={activeYear}
            availableYears={availableYears}
          />
        </div>

        {/* Language breakdown per user */}
        <div className="rounded-2xl p-8 bg-surface border border-border">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6 text-text-secondary font-mono">
            Languages
          </h2>
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${usernames.length}, 1fr)` }}
          >
            {usernames.map((username, i) => {
              const color = USER_COLORS[i]!;
              const yearData =
                activeYear === "all"
                  ? Object.values(dataByUser[username] ?? {})[0]
                  : dataByUser[username]?.[activeYear as number];
              const langs = yearData?.languages.slice(0, 5) ?? [];
              return (
                <div key={username}>
                  <div className="text-xs font-mono mb-3" style={{ color }}>@{username}</div>
                  {langs.length === 0 ? (
                    <div className="text-text-muted text-sm">—</div>
                  ) : (
                    <div className="space-y-2">
                      {langs.map((lang) => (
                        <div key={lang.name} className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: lang.color ?? color }}
                          />
                          <span className="text-text-primary text-xs font-mono truncate">{lang.name}</span>
                          <span className="text-text-muted text-xs ml-auto">{lang.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Personality tags per user */}
        <div className="rounded-2xl p-8 bg-surface border border-border">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6 text-text-secondary font-mono">
            Coding personality
          </h2>
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${usernames.length}, 1fr)` }}
          >
            {usernames.map((username, i) => {
              const color = USER_COLORS[i]!;
              const yearData =
                activeYear === "all"
                  ? Object.values(dataByUser[username] ?? {})[0]
                  : dataByUser[username]?.[activeYear as number];
              const tags = yearData?.personalityTags ?? [];
              return (
                <div key={username}>
                  <div className="text-xs font-mono mb-3" style={{ color }}>@{username}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs border"
                        style={{
                          backgroundColor: `${color}18`,
                          borderColor: `${color}40`,
                          color,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length === 0 && <span className="text-text-muted text-sm">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
