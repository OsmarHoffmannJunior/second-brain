import { NextRequest, NextResponse } from 'next/server';
import { createKeyword, getDb } from '@/lib/seo-db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientId = parseInt(id);
  if (isNaN(clientId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  try {
    const db = getDb();
    const keywords = db.prepare('SELECT * FROM keywords WHERE client_id = ? ORDER BY keyword ASC').all(clientId) as any[];

    const result = keywords.map(kw => {
      const allMonthly = db.prepare('SELECT * FROM keyword_monthly WHERE keyword_id = ? ORDER BY month ASC').all(kw.id) as any[];

      // Period filter for report view (best/recent per range)
      const filtered = allMonthly.filter((m: any) => {
        if (from && m.month < from) return false;
        if (to && m.month > to) return false;
        return true;
      });

      const bestAll = allMonthly.reduce((min: number, m: any) => m.position < min ? m.position : min, kw.initial_position ?? Infinity);
      const bestPosition = bestAll === Infinity ? null : bestAll;

      const recent = filtered.length > 0 ? filtered[filtered.length - 1] : null;

      return {
        id: kw.id,
        client_id: kw.client_id,
        keyword: kw.keyword,
        initial_position: kw.initial_position,
        initial_month: kw.initial_month,
        created_at: kw.created_at,
        // Full monthly history for detail page
        monthly: allMonthly.map((m: any) => ({ keyword_id: m.keyword_id, month: m.month, position: m.position })),
        // Report-specific fields when period filter is applied
        best_position: bestPosition,
        recent_position: recent?.position ?? null,
        recent_month: recent?.month ?? null,
        data_points: filtered.length,
      };
    });

    db.close();
    return NextResponse.json(result);
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
