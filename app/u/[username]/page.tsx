import { Suspense } from "react";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

// Metadata is static since we don't pre-generate per-user metadata
export const metadata = {
  title: "CodeStory — Your year in code",
  description: "A beautiful visual narrative of your coding journey.",
};

async function ProfileContent({ params }: Props) {
  const { username } = await params;

  if (!username || username.length > 39) notFound();

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 bg-background"
    >
      <div className="text-center max-w-md">
        <div
          className="text-6xl font-bold mb-4 font-mono text-text-primary"
        >
          Code<span className="text-brand">Story</span>
        </div>
        <p className="text-xl mb-2 text-text-primary">
          @{username}&apos;s coding story
        </p>
        <p className="mb-8 text-text-secondary">
          Sign in with GitHub to view the full story.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-brand text-white"
        >
          Generate your own CodeStory
        </a>
      </div>
    </main>
  );
}

export default function PublicProfilePage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-text-secondary">Loading...</div>
        </div>
      }
    >
      <ProfileContent params={params} />
    </Suspense>
  );
}
