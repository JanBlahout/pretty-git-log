import { Suspense } from "react";
import { Hero } from "@/components/landing/Hero";
import { CTASection } from "@/components/landing/CTASection";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Auth check wrapped in Suspense — request-time data must live inside a Suspense boundary
// when cacheComponents is enabled, per Next.js 16 requirements.
async function AuthRedirect() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return null;
}

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: "#0a0a0b" }}>
      <Suspense>
        <AuthRedirect />
      </Suspense>
      <Hero />

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-16"
            style={{ color: "#e4e4e7", fontFamily: "var(--font-mono)" }}
          >
            Everything about your year in code
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#141416", border: "1px solid #2a2a2e" }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#e4e4e7", fontFamily: "var(--font-mono)" }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "#71717a", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />

      <footer className="py-8 text-center" style={{ color: "#52525b", borderTop: "1px solid #2a2a2e" }}>
        <p>CodeStory · codestory.dev · Free forever</p>
      </footer>
    </main>
  );
}

const FEATURES = [
  {
    icon: "🔥",
    title: "Streaks & Activity",
    desc: "Your longest coding streaks, total active days, and a full contribution heatmap — just like GitHub's, but more beautiful.",
  },
  {
    icon: "📊",
    title: "Deep Analytics",
    desc: "When you code, what you build, which languages you use — time patterns broken down by hour, day, and month.",
  },
  {
    icon: "🎨",
    title: "Shareable Story",
    desc: "Get a public profile at /u/yourname. Download as an image. Share on X. Show the world your year in code.",
  },
  {
    icon: "🤖",
    title: "Coding Personality",
    desc: "Are you a night owl? A streak machine? A TypeScript purist? Discover your developer archetype from your own data.",
  },
  {
    icon: "🔄",
    title: "Year-over-Year",
    desc: "Compare this year to last year. See your growth as a developer tracked by commits, PRs, and active days.",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "No database. Your data lives on GitHub's servers. We just visualize it. One OAuth login, that's it.",
  },
];
