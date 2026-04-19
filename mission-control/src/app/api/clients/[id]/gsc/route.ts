import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/seo-db';
import * as fs from 'fs';

const TOKENS_FILE = '/root/.openclaw/credentials/google_tokens.json';
const CREDS_FILE = '/root/.openclaw/credentials/google_oauth.json';
const USAGE_FILE = '/root/.openclaw/credentials/gsc_usage.json';

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscResponse {
  rows: GscRow[];
  responseAggregationType: string;
}

// ─── Token management ───────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
  const expiresAt = tokens.token_expiry ?? 0;
  if (Date.now() >= expiresAt * 1000 - 60 * 1000) {
    const creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf-8')).installed;
    const resp = await fetch(creds.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.client_id,
        client_secret: creds.client_secret,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    if (!resp.ok) throw new Error('Token refresh failed');
    const newTokens = await resp.json();
    newTokens.refresh_token = tokens.refresh_token;
    newTokens.token_expiry = (Date.now() + (newTokens.expires_in ?? 3600) * 1000) / 1000;
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(newTokens, null, 2));
    return newTokens.access_token;
  }
  return tokens.access_token;
}

async function gscQuery(accessToken: string, siteUrl: string, body: object): Promise<GscResponse> {
  const resp = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GSC API error ${resp.status}: ${err}`);
  }
  return resp.json();
}

// ─── Usage tracking ────────────────────────────────────────────────────────

function getUsage(): { requests: number; lastReset: string } {
  const today = new Date().toISOString().split('T')[0];
  try {
    const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
    if (data.date !== today) return { requests: 0, lastReset: new Date().toISOString() };
    return { requests: data.requests ?? 0, lastReset: data.lastReset ?? today };
  } catch {
    return { requests: 0, lastReset: today };
  }
}

function incrementUsage(): number {
  const today = new Date().toISOString().split('T')[0];
  let data = { date: today, requests: 0, lastReset: new Date().toISOString() };
  try {
    data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
  } catch { /* use defaults */ }
  if (data.date !== today) {
    data = { date: today, requests: 0, lastReset: new Date().toISOString() };
  }
  data.requests += 1;
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
  return data.requests;
}

// ─── Route handlers ─────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const nid = parseInt(id);
  if (isNaN(nid)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const client = getClientById(nid);
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const gscUrl = client.gsc_property_url;
  if (!gscUrl) {
    return NextResponse.json({ error: 'GSC property URL not configured for this client' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'monthly';
  const from = searchParams.get('from') ?? new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
  const to = searchParams.get('to') ?? new Date().toISOString().split('T')[0];
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '1000'), 5000);

  try {
    const token = await getAccessToken();

    let payload: object;
    const baseParams = { startDate: from, endDate: to, rowLimit: limit };

    if (type === 'monthly') {
      payload = {
        ...baseParams,
        dimensions: ['date'],
        aggregationType: 'byProperty',
      };
    } else if (type === 'queries') {
      payload = {
        ...baseParams,
        dimensions: ['query'],
        rowLimit: Math.min(limit, 100),
      };
    } else if (type === 'pages') {
      payload = {
        ...baseParams,
        dimensions: ['page'],
        rowLimit: Math.min(limit, 100),
      };
    } else {
      return NextResponse.json({ error: 'Invalid type. Use: monthly, queries, pages' }, { status: 400 });
    }

    const data = await gscQuery(token, gscUrl, payload);
    incrementUsage();
    const usage = getUsage();

    // Normalize rows
    const rows = (data.rows ?? []).map((r: GscRow) => {
      if (type === 'monthly') {
        // dimensions: ['date'] → aggregate to month
        const dateStr: string = r.keys[0];
        const month = dateStr.substring(0, 7); // YYYY-MM
        return { month, clicks: r.clicks, impressions: r.impressions, ctr: Math.round(r.ctr * 10000) / 100, position: Math.round(r.position * 100) / 100 };
      } else if (type === 'queries') {
        return { query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: Math.round(r.ctr * 10000) / 100, position: Math.round(r.position * 100) / 100 };
      } else {
        return { pageUrl: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: Math.round(r.ctr * 10000) / 100, position: Math.round(r.position * 100) / 100 };
      }
    });

    // Aggregate daily → monthly if type=monthly
    let finalRows = rows;
    if (type === 'monthly') {
      const byMonth = new Map<string, { clicks: number; impressions: number; ctr_sum: number; ctr_count: number; pos_sum: number; pos_count: number }>();
      for (const r of rows as Array<{ month: string; clicks: number; impressions: number; ctr: number; position: number }>) {
        const existing = byMonth.get(r.month);
        if (existing) {
          existing.clicks += r.clicks;
          existing.impressions += r.impressions;
          existing.ctr_sum += r.ctr * r.clicks;
          existing.ctr_count += r.clicks;
          existing.pos_sum += r.position * r.clicks;
          existing.pos_count += r.clicks;
        } else {
          byMonth.set(r.month, {
            clicks: r.clicks,
            impressions: r.impressions,
            ctr_sum: r.ctr * r.clicks,
            ctr_count: r.clicks,
            pos_sum: r.position * r.clicks,
            pos_count: r.clicks,
          });
        }
      }
      finalRows = Array.from(byMonth.entries()).map(([month, agg]) => ({
        month,
        clicks: agg.clicks,
        impressions: agg.impressions,
        ctr: agg.ctr_count > 0 ? Math.round((agg.ctr_sum / agg.ctr_count) * 100) / 100 : 0,
        position: agg.pos_count > 0 ? Math.round((agg.pos_sum / agg.pos_count) * 100) / 100 : 0,
      })).sort((a, b) => a.month.localeCompare(b.month));
    }

    return NextResponse.json({
      rows: finalRows,
      totals: finalRows.length > 0 ? {
        clicks: finalRows.reduce((s, r) => s + r.clicks, 0),
        impressions: finalRows.reduce((s, r) => s + r.impressions, 0),
      } : null,
      lastUpdated: new Date().toISOString(),
      requestsToday: usage.requests,
      gscPropertyUrl: gscUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('GSC API Error:', message);
    if (message.includes('403') || message.includes('401') || message.includes('404')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
