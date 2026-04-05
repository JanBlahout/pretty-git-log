import type { ContributionCalendar } from "@/types/github";

export async function fetchContributionCalendar(
  token: string,
  login: string,
  year: number
): Promise<ContributionCalendar> {
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        login,
        from: `${year}-01-01T00:00:00Z`,
        to: `${year}-12-31T23:59:59Z`,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL → ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar: ContributionCalendar;
        };
      };
    };
  };

  return (
    json.data?.user?.contributionsCollection?.contributionCalendar ?? {
      totalContributions: 0,
      weeks: [],
    }
  );
}
