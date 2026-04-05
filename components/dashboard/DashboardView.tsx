"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CodeStoryData } from "@/types/stats";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { LanguageBreakdown } from "@/components/dashboard/LanguageBreakdown";
import { CodingSchedule } from "@/components/dashboard/CodingSchedule";
import { PersonalityTags } from "@/components/dashboard/PersonalityTags";
import { TopRepos } from "@/components/dashboard/TopRepos";
import { YearComparison } from "@/components/dashboard/YearComparison";
import { ShareCard } from "@/components/dashboard/ShareCard";
import { generateNarrative } from "@/lib/personality";
import { formatDate } from "@/utils/format";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

interface Props {
  data: CodeStoryData;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ScrollReveal>
      <div className="rounded-2xl p-8" style={{ backgroundColor: "#141416", border: "1px solid #2a2a2e" }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#71717a", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
          {title}
        </h2>
        {children}
      </div>
    </ScrollReveal>
  );
}

export function DashboardView({ data }: Props) {
  const narrative = generateNarrative(data);
  const memberSince = formatDate(data.createdAt);
  const yearsOnGitHub = new Date().getFullYear() - new Date(data.createdAt).getFullYear();

  const keyStats = [
    { label: "Total commits", value: data.totalCommits, sub: `${data.totalActiveDays} active days` },
    { label: "Pull requests", value: data.totalPRs, sub: `${data.totalPRsMerged} merged` },
    {
      label: "Longest streak",
      value: data.longestStreak.days,
      formatter: (n: number) => `${n}d`,
      sub: `Current: ${data.currentStreak}d`,
    },
    { label: "Total stars", value: data.totalStars, sub: `${data.totalRepos} repos` },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0b" }}>
      <DashboardNav login={data.login} year={data.year} />

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
                className="absolute inset-0 rounded-full opacity-40"
                style={{ backgroundColor: "#8b5cf6", filter: "blur(16px)", transform: "scale(0.85)" }}
              />
              <Image
                src={data.avatarUrl}
                alt={data.login}
                width={96}
                height={96}
                className="relative rounded-full"
                style={{ border: "2px solid rgba(139,92,246,0.5)" }}
              />
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: "#e4e4e7", fontFamily: "var(--font-mono)" }}
              >
                {data.name}&apos;s {data.year}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ color: "#71717a" }}
              >
                @{data.login} · on GitHub since {memberSince} · {yearsOnGitHub}y
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-5">
        <StatsCards stats={keyStats} />

        <Section title="Contribution activity">
          <ContributionHeatmap days={data.contributionDays} year={data.year} />
        </Section>

        <Section title="Monthly activity">
          <ActivityTimeline data={data.monthlyActivity} />
        </Section>

        <Section title="Languages">
          <LanguageBreakdown languages={data.languages} totalRepos={data.totalRepos} />
        </Section>

        <div className="grid md:grid-cols-2 gap-5">
          <Section title="When you code">
            <CodingSchedule
              commitsByHour={data.commitsByHour}
              commitsByDay={data.commitsByDay}
              peakHour={data.peakHour}
              codingPersonality={data.codingPersonality}
            />
          </Section>
          <Section title="Coding personality">
            <PersonalityTags tags={data.personalityTags} narrative={narrative} />
          </Section>
        </div>

        <Section title="Top repositories">
          <TopRepos repos={data.topRepos} />
        </Section>

        <Section title={`${data.year} vs ${data.year - 1}`}>
          <YearComparison
            year={data.year}
            current={{ commits: data.totalCommits, prs: data.totalPRs, repos: data.totalRepos }}
            prev={{ commits: data.prevYearCommits, prs: data.prevYearPRs, repos: data.prevYearRepos }}
          />
        </Section>

        <Section title="Share your story">
          <ShareCard data={data} />
        </Section>
      </div>
    </div>
  );
}
