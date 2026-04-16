import { NextRequest, NextResponse } from 'next/server';
import {
  getGscDaily,
  getGscMonthly,
  getGscQueries,
  getGscPages,
} from '@/lib/seo-db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientId = parseInt(id);
  if (isNaN(clientId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'daily';
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const limit = parseInt(searchParams.get('limit') ?? '50');

  try {
    if (type === 'daily') {
      return NextResponse.json(getGscDaily(clientId, from, to));
    } else if (type === 'monthly') {
      return NextResponse.json(getGscMonthly(clientId, from, to));
    } else if (type === 'queries') {
      return NextResponse.json(getGscQueries(clientId, limit));
    } else if (type === 'pages') {
      return NextResponse.json(getGscPages(clientId, limit));
    }
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
