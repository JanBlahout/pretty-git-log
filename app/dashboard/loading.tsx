export default function DashboardLoading() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
			<div className="text-4xl font-bold font-mono text-text-primary">
				Code<span className="text-brand">Story</span>
			</div>
			<div className="flex items-center gap-3 text-text-secondary">
				<Spinner />
				<span>Analyzing your repositories...</span>
			</div>
			<p className="text-text-muted text-sm">
				This may take a few seconds on the first load.
			</p>
		</div>
	);
}

function Spinner() {
	return (
		<div
			className="w-[18px] h-[18px] border-2 border-border border-t-brand rounded-full"
			style={{ animation: "spin 0.8s linear infinite" }}
		/>
	);
}
