import { NextRequest, NextResponse } from 'next/server';
import {
  importGscDaily,
  importGscQueries,
  importGscPages,
  logImport,
  getLastImport,
} from '@/lib/seo-db';

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

function parseGscDaily(rows: Record<string, string>[]) {
  return rows.map(r => ({
    date: r['Data'] ?? r['data'] ?? '',
    clicks: parseInt(r['Cliques'] ?? r['cliques'] ?? '0'),
    impressions: parseInt(r['Impressões'] ?? r['impressoes'] ?? '0'),
    ctr: parseFloat((r['CTR'] ?? r['ctr'] ?? '0').replace('%', '').replace(',', '.')),
    position: parseFloat((r['Posição'] ?? r['Posicao'] ?? r['position'] ?? '0').replace(',', '.')),
  })).filter(r => r.date && !isNaN(r.clicks));
}

function parseGscQueries(rows: Record<string, string>[]) {
  return rows.map(r => {
    const queryKey = Object.keys(r).find(k => /top consultas/i.test(k) || /query/i.test(k.toLowerCase())) ?? 'Top consultas';
    return {
      query: r[queryKey] ?? '',
      clicks: parseInt(r['Cliques'] ?? '0'),
      impressions: parseInt(r['Impressões'] ?? r['impressoes'] ?? '0'),
      ctr: parseFloat((r['CTR'] ?? '0').replace('%', '').replace(',', '.')),
      position: parseFloat((r['Posição'] ?? r['Posicao'] ?? '0').replace(',', '.')),
    };
  }).filter(r => r.query && r.clicks > 0);
}

function parseGscPages(rows: Record<string, string>[]) {
  return rows.map(r => {
    const urlKey = Object.keys(r).find(k => /páginas/i.test(k) || /pages/i.test(k.toLowerCase())) ?? 'Páginas principais';
    return {
      url: r[urlKey] ?? '',
      clicks: parseInt(r['Cliques'] ?? '0'),
      impressions: parseInt(r['Impressões'] ?? r['impressoes'] ?? '0'),
      ctr: parseFloat((r['CTR'] ?? '0').replace('%', '').replace(',', '.')),
      position: parseFloat((r['Posição'] ?? r['Posicao'] ?? '0').replace(',', '.')),
    };
  }).filter(r => r.url && r.clicks > 0);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientId = parseInt(id);
  if (isNaN(clientId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const body = await req.json();
    const { importType, csv, periodStart, periodEnd } = body;

    if (!csv) return NextResponse.json({ error: 'CSV data is required' }, { status: 400 });
    if (!['gsc_daily', 'gsc_queries', 'gsc_pages'].includes(importType)) {
      return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
    }

    if (periodStart && periodEnd) {
      const last = getLastImport(clientId, importType) as any;
      if (last && last.period_start === periodStart && last.period_end === periodEnd) {
        return NextResponse.json({ error: 'Dados deste período já foram importados. Delete o import anterior se quiser recarregar.' }, { status: 409 });
      }
    }

    const rows = parseCSV(csv);
    if (!rows.length) return NextResponse.json({ error: 'CSV sem dados válidos' }, { status: 400 });

    let count = 0;
    if (importType === 'gsc_daily') {
      const parsed = parseGscDaily(rows);
      count = importGscDaily(clientId, parsed);
    } else if (importType === 'gsc_queries') {
      const parsed = parseGscQueries(rows);
      count = importGscQueries(clientId, parsed, periodStart, periodEnd);
    } else if (importType === 'gsc_pages') {
      const parsed = parseGscPages(rows);
      count = importGscPages(clientId, parsed, periodStart, periodEnd);
    }

    logImport(clientId, importType, periodStart, periodEnd, count);
    return NextResponse.json({ success: true, rowsImported: count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Import failed' }, { status: 500 });
  }
}
