import { NextRequest, NextResponse } from 'next/server';
import { getKeywords, createKeyword } from '@/lib/seo-db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientId = parseInt(id);
  if (isNaN(clientId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    return NextResponse.json(getKeywords(clientId));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientId = parseInt(id);
  if (isNaN(clientId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const { keyword, initialPosition, initialMonth } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
    const kwId = createKeyword(clientId, keyword.trim(), initialPosition, initialMonth);
    return NextResponse.json({ id: kwId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
