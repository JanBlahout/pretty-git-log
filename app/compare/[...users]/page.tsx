import { Suspense } from "react";
import { fetchAndComputePublicStats } from "@/lib/stats-calculator";
import { CompareView } from "@/components/compare/CompareView";
import { getCurrentYear } from "@/utils/date";
import type { CodeStoryData } from "@/types/stats";
import Link from "next/link";

interface Props {
	params: Promise<{ users: string[] }>;
}

async function CompareContent({ params }: Props) {
	const { users: rawUsers } = await params;

	const usernames = [...new Set(rawUsers.map((u) => u.toLowerCase()))].slice(
		0,
		4,
	);

	if (usernames.length < 2) {
		return (
			<main className="min-h-screen flex items-center justify-center px-6 bg-background">
				<div className="text-center max-w-md">
					<div className="text-6xl font-bold mb-4 font-mono text-text-primary">
						Code<span className="text-brand">Story</span>
					</div>
					<p className="text-xl mb-2 text-text-primary">Compare developers</p>
					<p className="text-text-secondary mb-8">
						Provide at least 2 GitHub usernames in the URL.
					</p>
					<p className="font-mono text-sm text-text-muted bg-surface border border-border rounded-xl px-4 py-3">
						/compare/user1/user2/user3
					</p>
				</div>
			</main>
		);
	}

	const currentYear = getCurrentYear();

	const results = await Promise.allSettled(
		usernames.map((u) => fetchAndComputePublicStats(u, currentYear)),
	);

	const initialData: Record<string, CodeStoryData> = {};
	results.forEach((result, i) => {
		if (result.status === "fulfilled") {
			initialData[usernames[i]!] = result.value;
		}
	});

	const validUsernames = usernames.filter((u) => initialData[u]);

	if (validUsernames.length < 2) {
		return (
			<main className="min-h-screen flex items-center justify-center px-6 bg-background">
				<div className="text-center max-w-md">
					<div className="text-6xl font-bold mb-4 font-mono text-text-primary">
						Code<span className="text-brand">Story</span>
					</div>
					<p className="text-xl mb-2 text-text-primary">
						Couldn&apos;t load profiles
					</p>
					<p className="text-text-secondary mb-8">
						At least 2 valid public GitHub usernames are required.
					</p>
					<Link
						href="/"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-brand text-white"
					>
						Go home
					</Link>
				</div>
			</main>
		);
	}

	return (
		<CompareView
			usernames={validUsernames}
			initialData={initialData}
			currentYear={currentYear}
		/>
	);
}

function CompareLoading() {
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
				<span>Loading profiles...</span>
			</div>
		</div>
	);
}

export default function ComparePage({ params }: Props) {
	return (
		<Suspense fallback={<CompareLoading />}>
			<CompareContent params={params} />
		</Suspense>
	);
}
