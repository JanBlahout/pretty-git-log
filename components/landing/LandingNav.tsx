"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

export function LandingNav() {
	const { data: session } = useSession();

	return (
		<nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-background/85 backdrop-blur-md border-b border-border">
			<a
				href="/"
				className="font-mono font-bold text-text-primary hover:opacity-80 transition-opacity"
			>
				Code<span className="text-brand">Story</span>
			</a>
			{session ? (
				<a
					href="/dashboard"
					className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-brand/10 text-brand border border-brand/30 font-semibold"
				>
					Dashboard
				</a>
			) : (
				<button
					onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
					className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-brand/10 cursor-pointer text-brand border border-brand/30 font-semibold"
				>
					My CodeStory
				</button>
			)}
		</nav>
	);
}
