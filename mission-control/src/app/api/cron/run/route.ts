import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

async function createNotification(
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notifications`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type }),
      }
    );
  } catch {
    // Non-critical
  }
}

// POST: Trigger a cron job immediately (non-blocking)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Spawn without waiting — non-blocking
    const child = spawn("openclaw", ["cron", "run", id, "--force"], {
      timeout: 20000,
      detached: true,
      stdio: "ignore",
    });

    child.unref();

    // Create success notification
    await createNotification(
      "Cron Job Triggered",
      `Job "${id}" has been manually triggered.`,
      "success"
    );

    return NextResponse.json({
      success: true,
      jobId: id,
      message: "Job triggered successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to trigger job";
    console.error("Error triggering cron job:", error);

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
