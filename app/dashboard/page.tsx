import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchAndComputeStats } from "@/lib/stats-calculator";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getCurrentYear } from "@/utils/date";
import DashboardLoading from "./loading";

// Fetches session + data inside Suspense boundary (required by cacheComponents: true
// since auth() reads cookies, which are request-time/uncached data).
async function DashboardContent() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  const year = getCurrentYear();
  const data = await fetchAndComputeStats(session.accessToken, year);

  return <DashboardView data={data} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
