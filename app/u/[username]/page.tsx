import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
	fetchAndComputeStats,
	fetchAndComputePublicStats,
} from "@/lib/stats-calculator";
import { fetchPublicYearStats } from "@/app/actions";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getCurrentYear } from "@/utils/date";
import Link from "next/link";

interface Props {
	params: Promise<{ username: string }>;
}

export const metadata = {
	title: "CodeStory — Your year in code",
	description: "A beautiful visual narrative of your coding journey.",
};

async function ProfileContent({ params }: Props) {
	const { username } = await params;

	if (!username || username.length > 39) notFound();

	const session = await auth();
	const isOwner = session?.login?.toLowerCase() === username.toLowerCase();
	const currentYear = getCurrentYear();

	if (isOwner && session?.accessToken) {
		// Owner visiting their own profile — use their OAuth token for full data
		const data = await fetchAndComputeStats(session.accessToken, currentYear);
		const joinYear = new Date(data.createdAt).getFullYear();
		const availableYears = Array.from(
			{ length: currentYear - joinYear + 1 },
			(_, i) => currentYear - i,
		);
		return <DashboardView initialData={data} availableYears={availableYears} />;
	}

	if (!process.env.GITHUB_TOKEN) {
		return (
			<main className="min-h-screen flex items-center justify-center px-6 bg-background">
				<div className="text-center max-w-md">
					<div className="text-6xl font-bold mb-4 font-mono text-text-primary">
						Code<span className="text-brand">Story</span>
					</div>
					<p className="text-xl mb-2 text-text-primary">
						@{username}&apos;s coding story
					</p>
					<p className="mb-8 text-text-secondary">
						Public profiles are not enabled on this instance.
					</p>
					<Link
						href="/"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-brand text-white"
					>
						Generate your own CodeStory
					</Link>
				</div>
			</main>
		);
	}

	// Public visitor — use server PAT (public repos only)
	const data = await fetchAndComputePublicStats(username, currentYear);
	const joinYear = new Date(data.createdAt).getFullYear();
	const availableYears = Array.from(
		{ length: currentYear - joinYear + 1 },
		(_, i) => currentYear - i,
	);

	const boundFetchYear = fetchPublicYearStats.bind(null, username);
	const compareHref = session?.login
		? `/compare/${session.login}/${username}`
		: null;

	return (
		<>
			<DashboardView
				initialData={data}
				availableYears={availableYears}
				fetchYear={boundFetchYear}
			/>
			{compareHref && (
				<a
					href={compareHref}
					className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 bg-brand text-white border border-brand/50"
					style={{ boxShadow: "0 0 24px rgba(139,92,246,0.35)" }}
				>
					⚔️ Compare with me
				</a>
			)}
		</>
	);
}

function ProfileLoading() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
			<div className="text-4xl font-bold font-mono text-text-primary">
				Code<span className="text-brand">Story</span>
			</div>
			<div className="flex items-center gap-3 text-text-secondary">
				<div
					className="w-[18px] h-[18px] border-2 border-border border-t-brand rounded-full"
					style={{ animation: "spin 0.8s linear infinite" }}
				/>
				<span>Loading profile...</span>
			</div>
		</div>
	);
}

export default function PublicProfilePage({ params }: Props) {
	return (
		<Suspense fallback={<ProfileLoading />}>
			<ProfileContent params={params} />
		</Suspense>
	);
}
