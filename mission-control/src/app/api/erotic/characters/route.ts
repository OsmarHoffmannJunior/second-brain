import { NextRequest, NextResponse } from "next/server";
import { getCharacters, createCharacter } from "@/lib/erotic-store";

export async function GET() {
  try {
    const characters = getCharacters();
    return NextResponse.json({ characters });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const character = createCharacter(body);
    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create character";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
