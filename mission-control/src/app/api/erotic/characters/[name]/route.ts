import { NextResponse } from "next/server";
import { getCharacter, updateCharacter, deleteCharacter } from "@/lib/erotic-store";
import type { Character } from "@/lib/erotic-store";

type RouteContext = {
  params: Promise<{ name: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { name } = await params;
    const decoded = decodeURIComponent(name);
    const character = getCharacter(decoded);
    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    return NextResponse.json({ character });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { name } = await params;
    const decoded = decodeURIComponent(name);
    const body: Partial<Character> = await request.json();
    const updated = updateCharacter(decoded, body);
    if (!updated) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    return NextResponse.json({ character: updated });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { name } = await params;
    const decoded = decodeURIComponent(name);
    const deleted = deleteCharacter(decoded);
    if (!deleted) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
