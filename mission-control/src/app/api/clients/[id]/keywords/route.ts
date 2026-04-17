import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/seo-db';

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

      // Filter by period if provided
      const filtered = allMonthly.filter(m => {
        if (from && m.month < from) return false;
        if (to && m.month > to) return false;
        return true;
      });

      // Best position: lowest number in ALL historical data (not just filtered)
      const best = allMonthly.reduce((min, m) => m.position < min ? m.position : min, kw.initial_position ?? Infinity);
      const bestPosition = best === Infinity ? null : best;

      // Recent position: last in filtered range
      const recent = filtered.length > 0 ? filtered[filtered.length - 1] : null;

      return {
        id: kw.id,
        keyword: kw.keyword,
        initial_position: kw.initial_position,
        initial_month: kw.initial_month,
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
