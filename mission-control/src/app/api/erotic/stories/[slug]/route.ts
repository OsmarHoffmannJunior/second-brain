import { NextRequest, NextResponse } from "next/server";
import { getStory, updateStoryMeta, deleteStory } from "@/lib/erotic-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const story = getStory(params.slug);
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json();
    const story = updateStoryMeta(params.slug, body);
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const deleted = deleteStory(params.slug);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}