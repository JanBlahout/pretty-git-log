import { Hero } from "@/components/landing/Hero";
import { CTASection } from "@/components/landing/CTASection";
import { LandingNav } from "@/components/landing/LandingNav";

export default function LandingPage() {
  return (
    <main className="bg-background">
      <LandingNav />
      <Hero />

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-16 text-text-primary font-mono"
          >
            Everything about your year in code
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 bg-surface border border-border"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3
                  className="text-lg font-semibold mb-2 text-text-primary font-mono"
                >
                  {f.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />

      <footer className="py-8 text-center text-text-muted border-t border-border">
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
