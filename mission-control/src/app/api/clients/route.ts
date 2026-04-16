import { NextRequest, NextResponse } from 'next/server';
import { getAllClients, createClient } from '@/lib/seo-db';

export async function GET() {
  try {
    const clients = getAllClients();
    return NextResponse.json(clients);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, domain } = body;
    if (!name || !domain) {
      return NextResponse.json({ error: 'name and domain are required' }, { status: 400 });
    }
    const id = createClient(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
