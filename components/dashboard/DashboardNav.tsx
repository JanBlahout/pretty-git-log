"use client";

import { signOut } from "next-auth/react";

interface Props {
  login: string;
  year: number | string;
}

export function DashboardNav({ login, year }: Props) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-background/85 backdrop-blur-md border-b border-border"
    >
      <div className="font-mono font-bold text-text-primary">
        <a href="/" className="hover:opacity-80 transition-opacity">
          Code<span className="text-brand">Story</span>
        </a>
        <span className="text-text-muted font-normal ml-3 text-[13px]">
          @{login} · {year}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={`/u/${login}`}
          className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-white/5 text-text-secondary border border-border"
        >
          Public profile
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer text-text-secondary border border-border"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
