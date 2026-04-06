"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import type { CodeStoryData } from "@/types/stats";

interface Props {
  data: CodeStoryData;
}

interface Theme {
  name: string;
  swatch: string;
  gradient: string;
  tileBg: string;
  tileBorder: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
  accent: string;
  accentSub: string;
}

const THEMES: Theme[] = [
  {
    name: "Purple",
    swatch: "#8b5cf6",
    gradient: "linear-gradient(135deg, #141416 0%, #1c1c1f 100%)",
    tileBg: "#0a0a0b",
    tileBorder: "#2a2a2e",
    tagBg: "rgba(139,92,246,0.15)",
    tagBorder: "rgba(139,92,246,0.3)",
    tagText: "#a78bfa",
    accent: "#8b5cf6",
    accentSub: "#71717a",
  },
  {
    name: "Blue",
    swatch: "#3b82f6",
    gradient: "linear-gradient(135deg, #0d1117 0%, #0f172a 100%)",
    tileBg: "#0a0f1a",
    tileBorder: "#1e3a5f",
    tagBg: "rgba(59,130,246,0.15)",
    tagBorder: "rgba(59,130,246,0.3)",
    tagText: "#93c5fd",
    accent: "#3b82f6",
    accentSub: "#64748b",
  },
  {
    name: "Green",
    swatch: "#22c55e",
    gradient: "linear-gradient(135deg, #0a110d 0%, #0f1a12 100%)",
    tileBg: "#080e0a",
    tileBorder: "#1a3a22",
    tagBg: "rgba(34,197,94,0.15)",
    tagBorder: "rgba(34,197,94,0.3)",
    tagText: "#86efac",
    accent: "#22c55e",
    accentSub: "#4b7a57",
  },
  {
    name: "Rose",
    swatch: "#f43f5e",
    gradient: "linear-gradient(135deg, #110a0d 0%, #1a0f12 100%)",
    tileBg: "#0e0709",
    tileBorder: "#3a1a22",
    tagBg: "rgba(244,63,94,0.15)",
    tagBorder: "rgba(244,63,94,0.3)",
    tagText: "#fda4af",
    accent: "#f43f5e",
    accentSub: "#7a4b57",
  },
  {
    name: "Amber",
    swatch: "#f59e0b",
    gradient: "linear-gradient(135deg, #110f0a 0%, #1a160f 100%)",
    tileBg: "#0e0c07",
    tileBorder: "#3a300a",
    tagBg: "rgba(245,158,11,0.15)",
    tagBorder: "rgba(245,158,11,0.3)",
    tagText: "#fcd34d",
    accent: "#f59e0b",
    accentSub: "#7a6a30",
  },
  {
    name: "Cyan",
    swatch: "#06b6d4",
    gradient: "linear-gradient(135deg, #080f11 0%, #0c1a1f 100%)",
    tileBg: "#06090b",
    tileBorder: "#0e3040",
    tagBg: "rgba(6,182,212,0.15)",
    tagBorder: "rgba(6,182,212,0.3)",
    tagText: "#67e8f9",
    accent: "#06b6d4",
    accentSub: "#2a6070",
  },
];

export function ShareCard({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState<Theme>(THEMES[0]!);

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${data.login}`;
  const isAllTime = data.year === 0;
  const joinYear = new Date(data.createdAt).getFullYear();
  const yearLabel = isAllTime ? `since ${joinYear}` : String(data.year);

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    setDownloading(true);
    try {
      const el = document.getElementById("share-card-preview");
      if (!el) return;
      const png = await toPng(el, { pixelRatio: 2, width: 600, height: el.scrollHeight });
      const a = document.createElement("a");
      a.href = png;
      a.download = `codestory-${data.login}-${isAllTime ? "all-time" : data.year}.png`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const tweetText = encodeURIComponent(
    `My coding story ${isAllTime ? `since ${joinYear}` : `in ${data.year}`}: ${data.totalCommits.toLocaleString()} commits, ${data.totalPRs} PRs, ${data.longestStreak.days}d streak 🚀 ${profileUrl} via @codestorydev`
  );

  return (
    <div className="space-y-8">
      {/* Preview card */}
      <div className="flex justify-center">
        <div
          id="share-card-preview"
          className="rounded-2xl p-8 border overflow-hidden"
          style={{
            width: 600,
            background: theme.gradient,
            borderColor: theme.tileBorder,
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.avatarUrl} alt={data.login} className="w-14 h-14 rounded-full" />
            <div>
              <div className="font-bold text-[18px] font-mono" style={{ color: "#e4e4e7" }}>
                {data.name}&apos;s story {yearLabel}
              </div>
              <div className="text-sm" style={{ color: theme.accentSub }}>
                @{data.login} · codestory.dev
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "commits", value: data.totalCommits.toLocaleString() },
              { label: "PRs", value: String(data.totalPRs) },
              { label: "streak", value: `${data.longestStreak.days}d` },
              { label: "active days", value: String(data.totalActiveDays) },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: theme.tileBg, border: `1px solid ${theme.tileBorder}` }}
              >
                <div className="font-mono font-bold text-[22px]" style={{ color: "#e4e4e7" }}>
                  {s.value}
                </div>
                <div className="text-[11px] mt-1" style={{ color: theme.accentSub }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {data.personalityTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  background: theme.tagBg,
                  border: `1px solid ${theme.tagBorder}`,
                  color: theme.tagText,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="text-xs text-center" style={{ color: theme.accentSub }}>
            codestory.dev
          </div>
        </div>
      </div>

      {/* Color theme picker */}
      <div className="flex justify-center gap-3">
        {THEMES.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t)}
            title={t.name}
            className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 cursor-pointer"
            style={{
              background: t.swatch,
              borderColor: theme.name === t.name ? "#e4e4e7" : "transparent",
              boxShadow: theme.name === t.name ? `0 0 0 1px ${t.swatch}` : "none",
            }}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer bg-surface-2 border border-border text-text-primary"
        >
          {copied ? "✓ Copied!" : "🔗 Copy link"}
        </button>

        <button
          onClick={downloadImage}
          disabled={downloading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 bg-surface-2 border border-border text-text-primary"
        >
          {downloading ? "Generating..." : "⬇️ Download image"}
        </button>

        <a
          href={`https://x.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 bg-black text-white border border-neutral-700"
        >
          𝕏 Post to X
        </a>
      </div>
    </div>
  );
}
