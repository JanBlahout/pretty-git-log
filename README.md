# CodeStory

A beautiful visual narrative of your coding journey. Connect your GitHub account and get a shareable story of your commits, streaks, languages, pull requests, and coding personality — by year or all time.

**Live at [codestory.dev](https://codestory.dev)**

---

## Features

- **Contribution heatmap** — full-year calendar view of your activity
- **Streaks & active days** — longest and current coding streaks
- **Language breakdown** — top languages by bytes across your repos
- **Monthly activity** — commits and PRs charted by month
- **Coding personality** — developer archetype tags derived from your data
- **Top repositories** — your most-starred projects
- **Year-over-year comparison** — commits, PRs, and repos vs. the previous year
- **Year switcher** — jump between any year since you joined GitHub, or view all time
- **Public profiles** — shareable `/u/[username]` page visible to anyone
- **Developer comparison** — compare up to 4 GitHub users side by side at `/compare/user1/user2/user3`
- **Share card** — download a PNG summary card with customizable color themes
- **Privacy first** — no database; your data is fetched live from GitHub's API

---

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, `"use cache"`)
- [NextAuth v5](https://authjs.dev) — GitHub OAuth
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org) — charts
- [Framer Motion](https://www.framer.com/motion/) — animations
- [html-to-image](https://github.com/bubkoo/html-to-image) — share card PNG export

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/JanBlahout/codestory
cd codestory
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL (`http://localhost:3000` for local) |
| `GITHUB_TOKEN` | PAT for public profiles (`read:user` + `public_repo` scopes) |

**Create a GitHub OAuth App:**
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret into `.env.local`

**Create a GitHub PAT** (for public `/u/[username]` profiles):
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a token with `read:user` and `public_repo` scopes
3. Paste it as `GITHUB_TOKEN`

### 3. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com). Add all environment variables from `.env.example` in your project settings, then push to `main`.

For the OAuth App callback URL in production, update it to `https://yourdomain.com/api/auth/callback/github`.

---

## Project structure

```
app/
  page.tsx                    # Landing page
  dashboard/page.tsx          # Authenticated dashboard
  u/[username]/page.tsx       # Public profile (uses GITHUB_TOKEN PAT)
  compare/[...users]/page.tsx # Side-by-side developer comparison (up to 4 users)
  actions.ts                  # Server actions for lazy year fetching
components/
  dashboard/                  # Dashboard UI components
  compare/                    # Comparison page components
  landing/                    # Landing page components
  ui/                         # Shared UI primitives
lib/
  github.ts                   # GitHub REST API calls (authenticated + public)
  github-graphql.ts           # GitHub GraphQL (contribution calendar)
  stats-calculator.ts         # Data aggregation logic (own + public stats)
  personality.ts              # Coding personality tags + narrative
types/
  stats.ts                    # CodeStoryData type
  github.ts                   # GitHub API response types
```

---

## Developer comparison

Visit `/compare/user1/user2` (or add up to 4 usernames) to compare developers side by side.

```
/compare/JanBlahout/torvalds
/compare/JanBlahout/gaearon/tj
```

**What's shown:**
- Stats table with winner highlighted per category (commits, PRs, streak, active days, stars, top language)
- Monthly commits line chart (overlaid per user) for a selected year
- Annual commits bar chart when "All time" is selected
- Language breakdown and coding personality tags per user

**Year picker:** shows all years from the earliest join date across all users. Users who joined after the selected year show `—` for that column.

Uses `GITHUB_TOKEN` (public data only — same limitation as public profiles).
