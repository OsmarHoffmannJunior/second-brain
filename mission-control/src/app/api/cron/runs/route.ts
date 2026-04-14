import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const CRON_RUNS_DIR = (process.env.OPENCLAW_DIR || "/root/.openclaw") + "/cron/runs";

interface RunEntry {
  id: string;
  jobId: string;
  startedAt: string | null;
  completedAt: string | null;
  status: string;
  durationMs: number | null;
  error: string | null;
}

// GET: Fetch run history for a cron job from local JSONL file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const runsFile = join(CRON_RUNS_DIR, `${id}.jsonl`);
    const runs: RunEntry[] = [];

    if (existsSync(runsFile)) {
      const content = readFileSync(runsFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const r = JSON.parse(line);
          runs.push({
            id: r.id || `${id}-${r.ts}`,
            jobId: r.jobId || id,
            startedAt: r.startedAt
              ? new Date(r.startedAt).toISOString()
              : r.ts
              ? new Date(r.ts).toISOString()
              : null,
            completedAt: r.completedAt
              ? new Date(r.completedAt).toISOString()
              : null,
            status: r.status || "unknown",
            durationMs: r.durationMs || null,
            error: r.error || null,
          });
        } catch {
          // Skip malformed lines
        }
      }
    }

    // Sort by startedAt descending (most recent first)
    runs.sort(
      (a, b) =>
        new Date(b.startedAt || 0).getTime() -
        new Date(a.startedAt || 0).getTime()
    );

    return NextResponse.json({ runs, total: runs.length });
  } catch (error) {
    console.error("Error fetching run history:", error);
    return NextResponse.json(
      { error: "Failed to fetch run history" },
      { status: 500 }
    );
  }
}
