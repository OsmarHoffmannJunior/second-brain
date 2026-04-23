import { NextRequest, NextResponse } from "next/server";
import { getCharacters } from "@/lib/erotic-store";

export async function GET() {
  try {
    const characters = getCharacters();
    return NextResponse.json({ characters });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}