import { NextRequest, NextResponse } from "next/server";
import { getStories, createStory } from "@/lib/erotic-store";

export async function GET() {
  try {
    const stories = getStories();
    return NextResponse.json({ stories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const story = createStory(body);
    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}