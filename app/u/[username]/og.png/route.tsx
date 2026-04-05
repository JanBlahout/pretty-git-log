import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0a0b",
          fontFamily: "monospace",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: "#e4e4e7" }}>
            Code<span style={{ color: "#8b5cf6" }}>Story</span>
          </div>
          <div style={{ fontSize: 32, color: "#71717a" }}>@{username}&apos;s year in code</div>
          <div
            style={{
              marginTop: 16,
              padding: "10px 28px",
              borderRadius: 12,
              backgroundColor: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.4)",
              color: "#a78bfa",
              fontSize: 20,
            }}
          >
            codestory.dev
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
