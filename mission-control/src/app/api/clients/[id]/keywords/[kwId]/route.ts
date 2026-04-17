import { NextRequest, NextResponse } from 'next/server';
import { deleteKeyword, addKeywordPosition, deleteKeywordPosition } from '@/lib/seo-db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; kwId: string }> }) {
  const { kwId } = await params;
  const id = parseInt(kwId);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  if (month) {
    try { deleteKeywordPosition(id, month); return NextResponse.json({ success: true }); }
    catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
  }
  try {
    const ok = deleteKeyword(id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; kwId: string }> }) {
  const { kwId } = await params;
  const keywordId = parseInt(kwId);
  if (isNaN(keywordId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const { month, position } = await req.json();
    if (!month || position === undefined) return NextResponse.json({ error: 'month and position required' }, { status: 400 });
    addKeywordPosition(keywordId, month, parseFloat(position));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
