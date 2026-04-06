"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CodeStoryData } from "@/types/stats";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { LanguageBreakdown } from "@/components/dashboard/LanguageBreakdown";
import { PersonalityTags } from "@/components/dashboard/PersonalityTags";
import { TopRepos } from "@/components/dashboard/TopRepos";
import { YearComparison } from "@/components/dashboard/YearComparison";
import { ShareCard } from "@/components/dashboard/ShareCard";
import { generateNarrative } from "@/lib/personality";
import { formatDate } from "@/utils/format";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { YearTabs } from "@/components/dashboard/YearTabs";
import { MultiYearHeatmap } from "@/components/dashboard/MultiYearHeatmap";
import { fetchYearStats } from "@/app/actions";

interface Props {
  initialData: CodeStoryData;
  availableYears: number[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ScrollReveal>
      <div className="rounded-2xl p-8 bg-surface border border-border">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-6 text-text-secondary font-mono">
          {title}
        </h2>
        {children}
      </div>
    </ScrollReveal>
  );
}

function computeAggregate(allData: CodeStoryData[]): CodeStoryData {
  const latest = allData[0];

  const sumArray = (key: keyof CodeStoryData) =>
    (allData[0][key] as number[]).map((_, i) =>
      allData.reduce((acc, d) => acc + (d[key] as number[])[i], 0)
    );

  const bestStreak = allData.reduce(
    (best, d) => (d.longestStreak.days > best.days ? d.longestStreak : best),
    allData[0].longestStreak
  );

  const summedCommitsByHour = sumArray("commitsByHour");
  const peakHour = summedCommitsByHour.indexOf(Math.max(...summedCommitsByHour));

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap: Record<string, { commits: number; prs: number }> = {};
  for (const yearData of allData) {
    for (const m of yearData.monthlyActivity) {
      if (!monthlyMap[m.month]) monthlyMap[m.month] = { commits: 0, prs: 0 };
      monthlyMap[m.month].commits += m.commits;
      monthlyMap[m.month].prs += m.prs;
    }
  }
  const monthlyActivity = monthOrder
    .filter((m) => monthlyMap[m])
    .map((m) => ({ month: m, ...monthlyMap[m] }));

  return {
    ...latest,
    year: 0,
    totalCommits: allData.reduce((acc, d) => acc + d.totalCommits, 0),
    totalPRs: allData.reduce((acc, d) => acc + d.totalPRs, 0),
    totalPRsMerged: allData.reduce((acc, d) => acc + d.totalPRsMerged, 0),
    totalActiveDays: allData.reduce((acc, d) => acc + d.totalActiveDays, 0),
    longestStreak: bestStreak,
    contributionDays: allData.flatMap((d) => d.contributionDays),
    commitsByHour: summedCommitsByHour,
    commitsByDay: sumArray("commitsByDay"),
    commitsByMonth: sumArray("commitsByMonth"),
    peakHour,
    monthlyActivity,
    prevYearCommits: 0,
    prevYearPRs: 0,
    prevYearRepos: 0,
    yoyGrowth: { commitsChange: 0, prsChange: 0, reposChange: 0 },
  };
}

export function DashboardView({ initialData, availableYears }: Props) {
  const [dataByYear, setDataByYear] = useState<Record<number, CodeStoryData>>({
    [initialData.year]: initialData,
  });
  const [activeYear, setActiveYear] = useState<number | "all">(initialData.year);
  const [loadingYears, setLoadingYears] = useState<Set<number>>(new Set());

  const fetchedYears = availableYears.filter((y) => dataByYear[y]);
  const allFetched = fetchedYears.length === availableYears.length;

  // Background-fetch the previous year on mount so the comparison section is ready
  useEffect(() => {
    const prevYear = initialData.year - 1;
    if (!availableYears.includes(prevYear)) return;
    fetchYearStats(prevYear).then((data) =>
      setDataByYear((prev) => ({ ...prev, [prevYear]: data }))
    );
  }, []);

  const handleYearChange = async (year: number | "all") => {
    if (year === "all") {
      // Fetch all missing years in parallel
      const missing = availableYears.filter((y) => !dataByYear[y]);
      if (missing.length > 0) {
        setLoadingYears(new Set(missing));
        const results = await Promise.all(missing.map((y) => fetchYearStats(y)));
        setDataByYear((prev) => {
          const next = { ...prev };
          missing.forEach((y, i) => { next[y] = results[i]; });
          return next;
        });
        setLoadingYears(new Set());
      }
      setActiveYear("all");
      return;
    }

    setActiveYear(year);

    const toFetch = [year, year - 1].filter(
      (y) => availableYears.includes(y) && !dataByYear[y]
    );
    if (toFetch.length === 0) return;

    setLoadingYears((prev) => new Set([...prev, ...toFetch]));
    const results = await Promise.all(toFetch.map((y) => fetchYearStats(y)));
    setDataByYear((prev) => {
      const next = { ...prev };
      toFetch.forEach((y, i) => { next[y] = results[i]!; });
      return next;
    });
    setLoadingYears((prev) => {
      const next = new Set(prev);
      toFetch.forEach((y) => next.delete(y));
      return next;
    });
  };

  const sortedFetched = fetchedYears.sort((a, b) => b - a).map((y) => dataByYear[y]);

  const data =
    activeYear === "all"
      ? computeAggregate(sortedFetched.length > 0 ? sortedFetched : [initialData])
      : (dataByYear[activeYear] ?? initialData);

  const isLoading = activeYear !== "all" && loadingYears.has(activeYear as number);

  const narrative = generateNarrative(data);
  const memberSince = formatDate(data.createdAt);
  const yearsOnGitHub = new Date().getFullYear() - new Date(data.createdAt).getFullYear();
  const heroTitle =
    activeYear === "all" ? `${data.name}'s full story` : `${data.name}'s ${activeYear}`;
  const navYear = activeYear === "all" ? (allFetched ? "All time" : `${fetchedYears.length} years`) : activeYear;

  const keyStats = [
    { label: "Total commits", value: data.totalCommits, sub: `${data.totalActiveDays} active days` },
    { label: "Pull requests", value: data.totalPRs, sub: `${data.totalPRsMerged} merged` },
    {
      label: "Longest streak",
      value: data.longestStreak.days,
      formatter: (n: number) => `${n}d`,
      sub: `Current: ${data.currentStreak}d`,
    },
    { label: "Total stars", value: data.totalStars, sub: `${data.totalRepos} active repos` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav login={data.login} year={navYear} />

      {/* Hero header */}
      <div
        className="pt-24 pb-16 px-6"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 flex-wrap"
          >
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full opacity-40 bg-brand blur-[16px] scale-[85%]"
              />
              <Image
                src={data.avatarUrl}
                alt={data.login}
                width={96}
                height={96}
                className="relative rounded-full border-2 border-brand/50"
              />
            </div>
            <div>
              <motion.h1
                key={heroTitle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-2 text-text-primary font-mono"
              >
                {heroTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-text-secondary"
              >
                @{data.login} · on GitHub since {memberSince} · {yearsOnGitHub}y
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-5">
        <YearTabs
          activeYear={activeYear}
          availableYears={availableYears}
          loadingYears={loadingYears}
          onYearChange={handleYearChange}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-32 text-text-secondary">
            <div className="text-sm font-mono">Loading {activeYear}…</div>
          </div>
        ) : (
          <>
            <StatsCards stats={keyStats} />

            <Section title="Contribution activity">
              {activeYear === "all" ? (
                <MultiYearHeatmap
                  years={sortedFetched.map((d) => ({ year: d.year, days: d.contributionDays }))}
                />
              ) : (
                <ContributionHeatmap days={data.contributionDays} year={activeYear} />
              )}
            </Section>

            <Section title="Monthly activity">
              <ActivityTimeline data={data.monthlyActivity} />
            </Section>

            <Section title="Languages">
              <LanguageBreakdown languages={data.languages} totalRepos={data.totalRepos} />
            </Section>

            <Section title="Coding personality">
              <PersonalityTags tags={data.personalityTags} narrative={narrative} />
            </Section>

            <Section title="Top repositories">
              <TopRepos repos={data.topRepos} />
            </Section>

            {activeYear !== "all" && (
              <Section title={`${activeYear} vs ${activeYear - 1}`}>
                {(() => {
                  const prevData = dataByYear[activeYear - 1];
                  return (
                    <YearComparison
                      year={activeYear}
                      current={{ commits: data.totalCommits, prs: data.totalPRs, repos: data.totalRepos }}
                      prev={prevData
                        ? { commits: prevData.totalCommits, prs: prevData.totalPRs, repos: prevData.totalRepos }
                        : { commits: 0, prs: 0, repos: 0 }
                      }
                    />
                  );
                })()}
              </Section>
            )}

            <Section title="Share your story">
              <ShareCard data={data} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
