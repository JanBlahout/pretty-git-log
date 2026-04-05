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

  const currentYear = getCurrentYear();
  const data = await fetchAndComputeStats(session.accessToken, currentYear);

  const joinYear = new Date(data.createdAt).getFullYear();
  const availableYears = Array.from(
    { length: currentYear - joinYear + 1 },
    (_, i) => currentYear - i
  );

  return <DashboardView initialData={data} availableYears={availableYears} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
