# CodeStory — Complete development plan

## Overview

A web app that connects to GitHub (and optionally Azure DevOps), fetches a developer's contribution history, and generates a beautiful, shareable visual narrative of their coding journey. Think Spotify Wrapped for developers.

**URL:** codestory.dev
**Tagline:** "Your year in code, beautifully told"
**Build time:** 2 weeks
**Monthly cost:** $0

---

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR, API routes, static generation |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Rapid, consistent styling |
| Charts | Recharts | React-native charts, composable |
| Heatmap | Custom SVG component | GitHub-style contribution grid |
| Animations | Framer Motion | Page transitions, scroll reveals, staggered entry |
| Auth | NextAuth.js | GitHub OAuth |
| Image export | html-to-image | Generate shareable PNG/OG images |
| Hosting | Vercel | Free tier, edge functions |
| Database | None | GitHub API is the database |
| Analytics | Plausible or Umami | Privacy-friendly, free self-hosted |

---

## Pages and routes

```
/                           → Landing page (hero + example + CTA)
/api/auth/[...nextauth]     → NextAuth GitHub OAuth handler
/dashboard                  → Private dashboard (requires auth)
/u/[username]               → Public shareable profile (static snapshot)
/u/[username]/og.png        → Dynamic OG image for social sharing
```

---

## Data sources — what to fetch from GitHub API

### Endpoints needed

```typescript
// All authenticated with user's OAuth token

// 1. User profile
GET /user
→ { login, name, avatar_url, created_at, public_repos, followers }

// 2. All repos (paginated, up to 100 per page)
GET /user/repos?per_page=100&sort=pushed&type=all
→ [{ name, language, stargazers_count, pushed_at, fork }]

// 3. Commit activity per repo (last year)
GET /repos/{owner}/{repo}/stats/commit_activity
→ [{ week, total, days: [sun, mon, tue...] }]  // 52 weeks

// 4. Contribution calendar (GraphQL — most efficient)
query {
  user(login: "{username}") {
    contributionCalendar {
      totalContributions
      weeks {
        contributionDays {
          date
          contributionCount
          contributionLevel  // NONE, FIRST_QUARTILE, etc.
        }
      }
    }
  }
}

// 5. Language breakdown per repo
GET /repos/{owner}/{repo}/languages
→ { "TypeScript": 245000, "JavaScript": 12000, "CSS": 8000 }

// 6. Pull requests (search API)
GET /search/issues?q=author:{username}+type:pr+created:{year}
→ { total_count, items: [{ title, created_at, merged_at, repository_url }] }

// 7. Events (recent activity, last 90 days only)
GET /users/{username}/events?per_page=100
→ [{ type: "PushEvent", created_at, repo, payload }]
```

### Computed metrics (client-side or server-side)

```typescript
interface CodeStoryData {
  // Overview stats
  totalCommits: number;
  totalPRs: number;
  totalPRsMerged: number;
  totalRepos: number;
  totalLinesChanged: { added: number; removed: number };
  
  // Streaks
  longestStreak: { days: number; startDate: string; endDate: string };
  currentStreak: number;
  totalActiveDays: number;
  
  // Contribution heatmap (365 days)
  contributionDays: Array<{
    date: string;       // "2025-01-15"
    count: number;      // 0-20+
    level: 0 | 1 | 2 | 3 | 4;  // intensity quartile
  }>;
  
  // Language breakdown (aggregated across all repos)
  languages: Array<{
    name: string;       // "TypeScript"
    bytes: number;      // raw bytes
    percentage: number; // 0-100
    color: string;      // GitHub language color "#3178c6"
  }>;
  
  // Time patterns
  commitsByHour: number[];    // [0..23] — commits per hour of day
  commitsByDay: number[];     // [0..6] — commits per day of week (Sun=0)
  commitsByMonth: number[];   // [0..11] — commits per month
  peakHour: number;
  peakDay: string;
  codingPersonality: string;  // "Night owl" | "Early bird" | "9-to-5er" | "Weekend warrior"
  
  // Top repos
  topRepos: Array<{
    name: string;
    commits: number;
    language: string;
    stars: number;
    description: string;
  }>;
  
  // Monthly activity (for timeline chart)
  monthlyActivity: Array<{
    month: string;      // "Jan", "Feb"...
    commits: number;
    prs: number;
    reviews: number;
  }>;
  
  // Coding personality tags
  personalityTags: string[];  // ["TypeScript purist", "Streak machine", etc.]
  
  // Year-over-year comparison
  yoyGrowth: {
    commitsChange: number;     // percentage +/- vs previous year
    prsChange: number;
    reposChange: number;
  };
}
```

### Personality tag generation logic

```typescript
function generatePersonalityTags(data: CodeStoryData): string[] {
  const tags: string[] = [];
  
  // Time-based
  if (data.peakHour >= 22 || data.peakHour <= 4) tags.push("Night owl");
  else if (data.peakHour >= 5 && data.peakHour <= 8) tags.push("Early bird");
  else if (data.peakHour >= 9 && data.peakHour <= 17) tags.push("9-to-5 coder");
  
  // Streak-based
  if (data.longestStreak.days >= 30) tags.push("Streak machine");
  if (data.longestStreak.days >= 100) tags.push("Unstoppable");
  
  // Language-based
  const topLang = data.languages[0];
  if (topLang.percentage >= 60) tags.push(`${topLang.name} purist`);
  if (data.languages.length >= 5) tags.push("Polyglot coder");
  
  // Volume-based
  if (data.totalCommits >= 1000) tags.push("Commit machine");
  if (data.totalPRs >= 100) tags.push("PR powerhouse");
  if (data.totalActiveDays >= 300) tags.push("Every-day coder");
  
  // Pattern-based
  const weekendCommits = data.commitsByDay[0] + data.commitsByDay[6];
  const weekdayCommits = data.commitsByDay.slice(1, 6).reduce((a, b) => a + b, 0);
  if (weekendCommits > weekdayCommits * 0.4) tags.push("Weekend warrior");
  
  // PR style
  if (data.totalPRsMerged / data.totalPRs >= 0.9) tags.push("PR perfectionist");
  
  // Fullstack indicator
  const langNames = data.languages.map(l => l.name.toLowerCase());
  const hasFrontend = langNames.some(l => ['typescript', 'javascript', 'css', 'html'].includes(l));
  const hasBackend = langNames.some(l => ['python', 'go', 'rust', 'java', 'ruby', 'sql'].includes(l));
  if (hasFrontend && hasBackend) tags.push("Full-stack builder");
  
  return tags.slice(0, 5); // max 5 tags
}
```

---

## Dashboard sections and visualizations

The dashboard scrolls vertically as a single page, with each section animating in on scroll (Framer Motion). The sections are ordered to tell a narrative — from overview to deep-dive to personality.

### Section 1: Hero header

**Content:** Avatar, name, username, "Your [year] in code" title, member since date, total years on GitHub.

**Visual:** Large avatar with a subtle ring showing activity level. Staggered text animation on load.

**No chart needed** — just typography and layout.

---

### Section 2: Key metrics (4 stat cards)

**Content:** Total commits, PRs merged, longest streak, lines changed.

**Visual:** 4 metric cards in a row. Each has a large number, label, and a comparison subtitle ("+34% vs 2024" or "Top 8% of devs").

**Chart type:** None — just styled number cards with Framer Motion count-up animation on scroll entry. Numbers animate from 0 to final value over 1.5 seconds.

---

### Section 3: Contribution heatmap

**Content:** 52 weeks × 7 days grid showing daily contribution intensity.

**Chart type:** Custom SVG grid (not a library chart). Each cell is a small rounded rectangle colored by contribution level. This is the most recognizable "GitHub" visualization.

```
Implementation: Custom React component
- 52 columns (weeks) × 7 rows (days)
- Cell size: 12×12px with 3px gap
- Colors: 5 levels from gray (0) to deep green (4)
- Month labels below: Jan, Feb, Mar...
- Day labels left: Mon, Wed, Fri
- Tooltip on hover: "14 contributions on Mar 15, 2025"
- Animation: cells fade in column by column (left to right) on scroll
```

---

### Section 4: Monthly activity timeline

**Content:** Commits, PRs, and reviews per month across the year.

**Chart type: Area chart (Recharts)** — stacked or layered areas showing three metrics over 12 months. This tells the story of busy periods vs quiet months.

```
Implementation: Recharts AreaChart
- X axis: Jan through Dec
- Y axis: count
- 3 layered areas: commits (primary color), PRs (secondary), reviews (tertiary)
- Smooth curves (type="monotone")
- Custom tooltip showing exact numbers
- Gradient fill from solid to transparent
- Animation: areas draw in left-to-right on scroll
```

**Why area chart:** It shows the flow and rhythm of the year better than bar charts. You can immediately see "I went hard in March, took it easy in August, then ramped up for the Q4 launch."

---

### Section 5: Language breakdown

**Content:** Top 5-8 languages by bytes of code written, with percentages.

**Chart type: Horizontal bar chart + donut chart side by side.**

Left side: horizontal progress bars showing each language's percentage, colored with GitHub's official language colors (TypeScript = #3178c6, JavaScript = #f1e05a, etc.). Each bar has the language name, percentage, and a colored bar.

Right side: donut chart (Recharts PieChart with inner radius) showing the same data as proportional segments. The center of the donut shows total repos count.

```
Implementation:
- Left: custom styled bars (not a chart library — just divs with width%)
- Right: Recharts PieChart with innerRadius={60} outerRadius={90}
- GitHub language colors from: https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml
- Animation: bars grow from 0% to final width, donut segments animate in
```

**Why both:** The bars give precise readable percentages, the donut gives an instant visual sense of proportion. Together they fill the section nicely.

---

### Section 6: When you code (activity heatmap by hour × day)

**Content:** 24 hours × 7 days grid showing when the user is most active.

**Chart type: Custom SVG heatmap** — similar to the contribution grid but mapped to time-of-day (rows) × day-of-week (columns). Color intensity shows commit density.

```
Implementation: Custom React component
- 7 columns (Mon–Sun) × 24 rows (hours), or simplified to 7×12 (2-hour blocks)
- Color: single ramp from transparent to deep purple (or brand color)
- Labels: hours on Y axis (6am, 9am, 12pm...), days on X axis
- Highlight card below: "Your peak hours: 9-11 AM & 2-5 PM"
- Personality label: "You're a focused morning coder"
- Animation: cells fade in with random stagger for a "reveal" effect
```

---

### Section 7: Coding personality

**Content:** 3-5 personality tags based on computed patterns, plus a short narrative paragraph describing the user's coding style.

**Chart type: None** — this is a text + badges section. The tags are colored pills (like Spotify's genre tags). Below them, a 2-3 sentence AI-free paragraph generated from templates:

```typescript
// Template-based, no AI needed
`You shipped ${percentileText} more code than the average GitHub user in ${year}. 
Your longest streak was ${streak} days — only ${streakPercentile}% of developers 
maintain streaks that long. You favor ${prSizeText} PRs (avg ${avgPRSize} lines) 
and your most productive month was ${peakMonth}.`
```

**Visual:** Tags animate in one by one with a pop effect. The paragraph fades in after.

---

### Section 8: Top repositories

**Content:** Top 5 repos by commit count, with language badge, stars, and commit count.

**Chart type: Horizontal bar chart (Recharts BarChart)** — repos ranked by commits, with language-colored bars.

```
Implementation: Recharts BarChart (layout="vertical")
- Y axis: repo names
- X axis: commit count
- Bars colored by primary language
- Star count as a secondary label
- Click/tap opens the repo on GitHub
```

---

### Section 9: Collaboration graph

**Content:** Top 5 people the user has worked with most (shared repos, PR reviews, co-authored commits).

**Chart type: Custom component** — not really a chart, more of a styled list with avatar circles and relationship indicators.

```
Implementation: Custom React component
- Each collaborator: avatar circle (initials), name, "42 shared PRs" subtitle
- Optional: simple force-directed graph using D3 (impressive but optional)
  - Center node: the user
  - Connected nodes: collaborators, sized by interaction count
  - Edges: thickness = number of shared PRs
- Animation: nodes float in and connect with drawn lines
```

**D3 force graph is optional** — the simple list version takes 30 minutes, the force graph takes a full day. Build the list first, add the graph if you have time. The force graph looks incredibly impressive in demos though.

---

### Section 10: Year-over-year comparison

**Content:** How this year compares to last year — commits, PRs, repos, active days.

**Chart type: Grouped bar chart (Recharts BarChart)** — two bars per metric (this year vs last year), with percentage change labels.

```
Implementation: Recharts BarChart
- X axis: Commits, PRs, Repos, Active days
- 2 bars per group: 2024 (gray) vs 2025 (brand color)
- Percentage change label above each pair: "+34%" in green or "-12%" in red
- Animation: bars grow upward on scroll
```

---

### Section 11: Share card

**Content:** "Share your coding story" CTA with action buttons.

**Visual:** Centered card with 3 buttons — "Copy link", "Download as image", "Post to X".

```
Implementation:
- "Copy link" → copies /u/{username} to clipboard
- "Download as image" → html-to-image captures a pre-designed share card
  - Share card: 1200×630px (OG image size)
  - Contains: avatar, name, 4 key stats, heatmap mini, personality tags
  - Branded with CodeStory logo + URL
- "Post to X" → opens Twitter intent with pre-filled text + image
```

---

## Share card / OG image design

When someone shares their CodeStory link on Twitter/LinkedIn, the OG image should be compelling enough to make viewers want to generate their own. The image is generated server-side using `@vercel/og` (Satori).

```
Layout (1200×630px):
┌──────────────────────────────────────────────────┐
│  [Avatar]  Jan's 2025 in code                    │
│            @jandev · codestory.dev               │
│                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ 1,247  │ │  186   │ │  47d   │ │  89K   │   │
│  │commits │ │PRs     │ │streak  │ │lines   │   │
│  └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                  │
│  [Mini heatmap - 52 weeks simplified]            │
│                                                  │
│  ┌─────────────────┐ ┌─────────────────────────┐│
│  │TS 62% ████████  │ │ Night owl · Streak      ││
│  │JS 18% ███       │ │ machine · Full-stack    ││
│  │SQL 9% ██        │ │ builder                 ││
│  └─────────────────┘ └─────────────────────────┘│
│                                                  │
│              codestory.dev                       │
└──────────────────────────────────────────────────┘
```

---

## Visual design direction

**Aesthetic:** Dark theme primary (like Spotify Wrapped), with an optional light mode toggle. Dark backgrounds make the colored charts and heatmaps pop dramatically. The dark theme also feels more "developer-y" and aligns with terminal/IDE aesthetics.

**Color palette:**
- Background: #0a0a0b (near-black)
- Surface: #141416 (cards)
- Border: #2a2a2e (subtle)
- Text primary: #e4e4e7
- Text secondary: #71717a
- Brand accent: #8b5cf6 (purple — distinctive, works on dark bg)
- Heatmap: 5-stop green ramp (#161b22, #0e4429, #006d32, #26a641, #39d353)
- Language colors: from GitHub Linguist (official)

**Typography:**
- Headings: JetBrains Mono or Geist Mono (monospace = developer vibe)
- Body: Geist Sans or Satoshi
- Stats/numbers: JetBrains Mono (tabular figures)

**Animations:**
- Sections reveal on scroll (Framer Motion viewport detection)
- Numbers count up from 0 to final value
- Heatmap cells cascade left-to-right
- Chart elements draw in progressively
- Personality tags pop in one at a time with spring physics

---

## Project structure

```
codestory/
├── app/
│   ├── layout.tsx                 # Root layout (fonts, theme, metadata)
│   ├── page.tsx                   # Landing page
│   ├── dashboard/
│   │   └── page.tsx               # Private dashboard (auth-protected)
│   ├── u/
│   │   └── [username]/
│   │       ├── page.tsx           # Public shareable profile
│   │       └── og.png/
│   │           └── route.tsx      # Dynamic OG image generation
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts       # NextAuth handler
│       └── github/
│           └── stats/
│               └── route.ts       # Fetch + compute GitHub stats
├── src/
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── ExampleDashboard.tsx
│   │   │   └── CTASection.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx          # Section 2: key metrics
│   │   │   ├── ContributionHeatmap.tsx # Section 3: 52×7 grid
│   │   │   ├── ActivityTimeline.tsx    # Section 4: area chart
│   │   │   ├── LanguageBreakdown.tsx   # Section 5: bars + donut
│   │   │   ├── CodingSchedule.tsx      # Section 6: hour×day heatmap
│   │   │   ├── PersonalityTags.tsx     # Section 7: badges + narrative
│   │   │   ├── TopRepos.tsx            # Section 8: ranked bars
│   │   │   ├── Collaborators.tsx       # Section 9: list or force graph
│   │   │   ├── YearComparison.tsx      # Section 10: grouped bars
│   │   │   └── ShareCard.tsx           # Section 11: share CTAs
│   │   └── ui/
│   │       ├── AnimatedNumber.tsx      # Count-up animation
│   │       ├── ScrollReveal.tsx        # Framer Motion scroll wrapper
│   │       ├── Tooltip.tsx
│   │       └── Badge.tsx
│   ├── lib/
│   │   ├── github.ts              # GitHub API client
│   │   ├── github-graphql.ts      # GraphQL queries
│   │   ├── stats-calculator.ts    # Raw data → CodeStoryData
│   │   ├── personality.ts         # Tag generation logic
│   │   ├── language-colors.ts     # GitHub language → hex color map
│   │   └── auth.ts                # NextAuth config
│   ├── types/
│   │   ├── github.ts              # GitHub API response types
│   │   └── stats.ts               # CodeStoryData interface
│   └── utils/
│       ├── date.ts                # Date helpers
│       ├── format.ts              # Number formatting (1247 → "1,247")
│       └── percentile.ts          # "Top 8% of devs" calculation
├── public/
│   └── fonts/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Development phases

### Phase 1: Foundation (Days 1-3)
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS with custom dark theme
- [ ] Set up NextAuth.js with GitHub provider
- [ ] Build landing page (hero, example preview, CTA)
- [ ] Create GitHub API client with pagination handling
- [ ] Create GitHub GraphQL client for contribution calendar
- [ ] Build stats calculator (raw API data → CodeStoryData)
- **Milestone: Can authenticate and fetch real GitHub data**

### Phase 2: Core visualizations (Days 4-8)
- [ ] Build StatsCards with AnimatedNumber count-up
- [ ] Build ContributionHeatmap (custom SVG, 52×7 grid)
- [ ] Build ActivityTimeline (Recharts area chart)
- [ ] Build LanguageBreakdown (bars + donut)
- [ ] Build CodingSchedule (hour×day heatmap)
- [ ] Build PersonalityTags with template-based narrative
- [ ] Build TopRepos (horizontal bar chart)
- [ ] Build Collaborators list
- [ ] Build YearComparison (grouped bar chart)
- [ ] Add ScrollReveal wrapper (Framer Motion InView)
- **Milestone: Full dashboard renders with real data**

### Phase 3: Sharing and polish (Days 9-12)
- [ ] Build public profile page (/u/[username])
- [ ] Generate dynamic OG image with @vercel/og
- [ ] Implement "Download as image" (html-to-image)
- [ ] Implement "Copy link" and "Post to X" buttons
- [ ] Add loading skeleton states
- [ ] Polish animations (staggered reveals, spring physics)
- [ ] Responsive design (mobile-friendly dashboard)
- [ ] Error handling (API rate limits, private repos)
- [ ] Add light/dark mode toggle
- **Milestone: Shareable, polished, production-ready**

### Phase 4: Launch (Days 13-14)
- [ ] Deploy to Vercel
- [ ] Set up custom domain (codestory.dev)
- [ ] Test with 5-10 different GitHub accounts
- [ ] Create your own CodeStory and share it
- [ ] Post on X, Reddit r/webdev, Hacker News Show HN
- [ ] Add to your portfolio site
- **Milestone: Live and shared**

---

## Environment variables

```
GITHUB_CLIENT_ID=your_github_oauth_app_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_secret
NEXTAUTH_SECRET=random_secret_string
NEXTAUTH_URL=https://codestory.dev
```

That's it. Four env vars. No database credentials, no API keys for paid services, no infrastructure to configure.

---

## API rate limiting strategy

GitHub API allows 5,000 requests/hour for authenticated users. A single CodeStory generation requires roughly 10-50 API calls (depending on number of repos). To stay safe:

- Cache computed stats in memory for 1 hour (Map or lru-cache)
- Use GraphQL for contribution calendar (1 call instead of 365)
- Aggregate language stats across repos in parallel (Promise.all)
- If a user has 100+ repos, only analyze the top 50 by recent push date
- Show a progress indicator: "Analyzing 47 repositories..."

---

## Azure DevOps support (future enhancement)

Can be added later as a second data provider. The dashboard components stay identical — only the data fetching layer changes.

```typescript
// Provider interface (same as discussed before)
interface StatsProvider {
  fetchStats(year: number): Promise<CodeStoryData>;
}

// Toggle on the dashboard
<ProviderSelector>
  <GitHubProvider />     // OAuth flow
  <AzureDevOpsProvider /> // PAT input field
</ProviderSelector>
```

Add this in week 3 if the GitHub version is working well. Adds ~3-4 days of work.

---

## Summary of all visualizations

| Section | Chart type | Library | Complexity |
|---------|-----------|---------|------------|
| Key metrics | Animated numbers | Framer Motion | Easy |
| Contribution heatmap | Custom SVG grid (52×7) | Custom React | Medium |
| Monthly timeline | Stacked area chart | Recharts | Easy |
| Language breakdown | Horizontal bars + donut | Custom + Recharts | Easy |
| Coding schedule | Custom SVG heatmap (24×7) | Custom React | Medium |
| Personality tags | Styled badges | Tailwind + Framer | Easy |
| Top repos | Horizontal bar chart | Recharts | Easy |
| Collaborators | Styled list (or D3 force graph) | Custom (or D3) | Easy/Hard |
| Year comparison | Grouped bar chart | Recharts | Easy |
| Share card / OG | Static image generation | @vercel/og | Medium |
