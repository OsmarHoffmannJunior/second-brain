import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient, getImports } from '@/lib/seo-db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nid = parseInt(id);
  if (isNaN(nid)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const client = getClientById(nid);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const imports = getImports(nid);
  return NextResponse.json({ ...client, imports });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nid = parseInt(id);
  if (isNaN(nid)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const body = await req.json();
    delete body.id;
    delete body.created_at;
    const ok = updateClient(nid, body);
    if (!ok) return NextResponse.json({ error: 'Not found or no changes' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nid = parseInt(id);
  if (isNaN(nid)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const ok = deleteClient(nid);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
