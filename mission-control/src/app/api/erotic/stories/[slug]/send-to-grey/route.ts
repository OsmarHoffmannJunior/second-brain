import { NextRequest, NextResponse } from "next/server";
import { sendToGrey } from "@/lib/erotic-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const taskId = sendToGrey(params.slug);
    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send to grey" }, { status: 500 });
  }
}