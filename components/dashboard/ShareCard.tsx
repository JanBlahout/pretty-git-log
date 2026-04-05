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
      const png = await toPng(el, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = png;
      a.download = `codestory-${data.login}-${data.year}.png`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const tweetText = encodeURIComponent(
    `My ${data.year} in code: ${data.totalCommits.toLocaleString()} commits, ${data.totalPRs} PRs, ${data.longestStreak.days}d streak 🚀 ${profileUrl} via @codestorydev`
  );

  return (
    <div className="space-y-8">
      {/* Preview card */}
      <div
        id="share-card-preview"
        className="rounded-2xl p-8 max-w-2xl mx-auto"
        style={{
          background: "linear-gradient(135deg, #141416 0%, #1c1c1f 100%)",
          border: "1px solid #2a2a2e",
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.avatarUrl} alt={data.login} className="w-14 h-14 rounded-full" />
          <div>
            <div style={{ color: "#e4e4e7", fontWeight: 700, fontSize: 18, fontFamily: "var(--font-mono)" }}>
              {data.name}&apos;s {data.year} in code
            </div>
            <div style={{ color: "#71717a", fontSize: 14 }}>@{data.login} · codestory.dev</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "commits", value: data.totalCommits.toLocaleString() },
            { label: "PRs", value: String(data.totalPRs) },
            { label: "streak", value: `${data.longestStreak.days}d` },
            { label: "active days", value: String(data.totalActiveDays) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "#0a0a0b" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 22, color: "#e4e4e7" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "#71717a" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {data.personalityTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs"
              style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ color: "#52525b", fontSize: 12, textAlign: "center" }}>codestory.dev</div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#1c1c1f", border: "1px solid #2a2a2e", color: "#e4e4e7" }}
        >
          {copied ? "✓ Copied!" : "🔗 Copy link"}
        </button>

        <button
          onClick={downloadImage}
          disabled={downloading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "#1c1c1f", border: "1px solid #2a2a2e", color: "#e4e4e7" }}
        >
          {downloading ? "Generating..." : "⬇️ Download image"}
        </button>

        <a
          href={`https://x.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#000", color: "#fff", border: "1px solid #333" }}
        >
          𝕏 Post to X
        </a>
      </div>
    </div>
  );
}
