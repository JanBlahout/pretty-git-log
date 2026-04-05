"use server";

import { auth } from "@/lib/auth";
import { fetchAndComputeStats } from "@/lib/stats-calculator";
import type { CodeStoryData } from "@/types/stats";

export async function fetchYearStats(year: number): Promise<CodeStoryData> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Not authenticated");
  return fetchAndComputeStats(session.accessToken, year);
}
