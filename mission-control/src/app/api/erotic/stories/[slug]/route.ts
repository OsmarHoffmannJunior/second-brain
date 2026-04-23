import { NextRequest, NextResponse } from "next/server";
import { getStory, updateStoryMeta, deleteStory } from "@/lib/erotic-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const story = getStory(slug);
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const story = updateStoryMeta(slug, body);
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const deleted = deleteStory(slug);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}