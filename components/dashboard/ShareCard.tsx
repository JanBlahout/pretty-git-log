"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import type { CodeStoryData } from "@/types/stats";

interface Props {
  data: CodeStoryData;
}

export function ShareCard({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
      {/* Preview card — flex wrapper handles centering, NOT the captured element */}
      <div className="flex justify-center">
      <div
        id="share-card-preview"
        className="rounded-2xl p-8 border border-border overflow-hidden bg-[linear-gradient(135deg,#141416_0%,#1c1c1f_100%)]"
        style={{ width: 600 }}
      >
        <div className="flex items-center gap-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.avatarUrl} alt={data.login} className="w-14 h-14 rounded-full" />
          <div>
            <div className="text-text-primary font-bold text-[18px] font-mono">
              {data.name}&apos;s story {yearLabel}
            </div>
            <div className="text-text-secondary text-sm">@{data.login} · codestory.dev</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "commits", value: data.totalCommits.toLocaleString() },
            { label: "PRs", value: String(data.totalPRs) },
            { label: "streak", value: `${data.longestStreak.days}d` },
            { label: "active days", value: String(data.totalActiveDays) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center bg-background">
              <div className="font-mono font-bold text-[22px] text-text-primary">
                {s.value}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {data.personalityTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs bg-brand/[15%] text-brand-light border border-brand/30"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="text-text-muted text-xs text-center">codestory.dev</div>
      </div>
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
