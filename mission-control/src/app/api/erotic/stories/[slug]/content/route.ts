import { NextRequest, NextResponse } from "next/server";
import { getStory, updateStoryContent } from "@/lib/erotic-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const story = getStory(params.slug);
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ content: story.content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { content } = await req.json();
    const success = updateStoryContent(params.slug, content);
    if (!success) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}