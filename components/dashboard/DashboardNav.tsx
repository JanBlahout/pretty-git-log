"use client";

import { signOut } from "next-auth/react";

interface Props {
  login: string;
  year: number;
}

export function DashboardNav({ login, year }: Props) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
      style={{
        backgroundColor: "rgba(10,10,11,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2a2a2e",
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#e4e4e7" }}>
        Code<span style={{ color: "#8b5cf6" }}>Story</span>
        <span style={{ color: "#52525b", fontWeight: 400, marginLeft: 12, fontSize: 13 }}>
          @{login} · {year}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={`/u/${login}`}
          className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "#71717a", border: "1px solid #2a2a2e" }}
        >
          Public profile
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
          style={{ color: "#71717a", border: "1px solid #2a2a2e" }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
