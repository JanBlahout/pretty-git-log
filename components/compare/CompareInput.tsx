"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
	myLogin: string;
}

export function CompareInput({ myLogin }: Props) {
	const [value, setValue] = useState("");
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const username = value.trim().replace(/^@/, "");
		if (!username) return;
		router.push(`/compare/${myLogin}/${username}`);
	};

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<span className="text-text-muted text-sm font-mono hidden sm:inline">
				compare with
			</span>
			<div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 focus-within:border-brand/50 transition-colors">
				<span className="text-text-muted text-sm">@</span>
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="username"
					className="bg-transparent text-text-primary text-sm font-mono outline-none w-28 placeholder:text-text-muted"
				/>
			</div>
			<button
				type="submit"
				disabled={!value.trim()}
				className="px-4 py-2 rounded-xl text-sm font-medium bg-brand/10 text-brand border border-brand/30 hover:bg-brand/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
			>
				Compare
			</button>
		</form>
	);
}
