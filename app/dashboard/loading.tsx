export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: "#0a0a0b" }}
    >
      <div
        className="text-4xl font-bold"
        style={{ fontFamily: "var(--font-mono)", color: "#e4e4e7" }}
      >
        Code<span style={{ color: "#8b5cf6" }}>Story</span>
      </div>
      <div
        className="flex items-center gap-3"
        style={{ color: "#71717a" }}
      >
        <Spinner />
        <span>Analyzing your repositories...</span>
      </div>
      <p style={{ color: "#52525b", fontSize: 14 }}>
        This may take a few seconds on the first load.
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        border: "2px solid #2a2a2e",
        borderTopColor: "#8b5cf6",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}
