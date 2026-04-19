'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

// ─── Types ────────────────────────────────────────────────────────────────

interface Client {
  id: number;
  name: string;
  domain: string;
  gsc_property_url?: string;
}

interface GscMonthly { month: string; clicks: number; impressions: number; ctr: number; position: number; }
interface GscQuery { query: string; clicks: number; impressions: number; ctr: number; position: number; }
interface GscPage { pageUrl: string; clicks: number; impressions: number; ctr: number; position: number; }

interface GscMeta { requestsToday: number; lastUpdated: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────

const fmtNum = (n: number) => n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString('pt-BR');
const fmtFull = (n: number) => n.toLocaleString('pt-BR');
const fmtPct = (n: number) => n.toFixed(2)+'%';
const fmtPos = (n: number) => n.toFixed(2);

function delta(curr: number, prev: number, positiveIsGood = true) {
  if (!prev) return null;
  const diff = ((curr - prev) / prev) * 100;
  const isPositive = diff >= 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  return { diff, isGood };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr/24)}d`;
}

// ─── GscBadge ─────────────────────────────────────────────────────────────

function GscBadge() {
  return (
    <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded font-medium">
      🔵 Google Search Console
    </span>
  );
}

// ─── GscUsageBadge ────────────────────────────────────────────────────────

function GscUsageBadge({ meta }: { meta: GscMeta | null }) {
  if (!meta) return null;
  const { requestsToday, lastUpdated } = meta;
  const warn = requestsToday > 8000;
  return (
    <span className={`text-xs ${warn ? 'text-amber-400' : 'text-[var(--text-muted)]'} flex items-center gap-1`}>
      ⏱ Atualizado há {timeAgo(lastUpdated)} • {requestsToday.toLocaleString()} requisições hoje
      {warn && <AlertTriangle size={11} className="text-amber-400" />}
    </span>
  );
}

// ─── Section: Monthly Traffic ────────────────────────────────────────────

function MonthlySection({ clientId, gscUrl }: { clientId: string; gscUrl?: string }) {
  const [rows, setRows] = useState<GscMonthly[]>([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<GscMeta | null>(null);

  const load = async () => {
    if (!gscUrl) return;
    setLoading(true);
    setError(null);
    try {
      const u = `/api/clients/${clientId}/gsc?type=monthly&from=${from}&to=${to}`;
      const d = await fetch(u).then(r => r.json());
      if (d.error) { setError(d.error); setRows([]); }
      else { setRows(d.rows || []); setMeta({ requestsToday: d.requestsToday ?? 0, lastUpdated: d.lastUpdated ?? '' }); }
    } catch { setError('Erro de conexão'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId, from, to, gscUrl]);

  const totalClicks = rows.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalImpr = rows.reduce((s, m) => s + (m.impressions || 0), 0);
  const avgCtr = rows.length ? rows.reduce((s, m) => s + (m.ctr || 0), 0) / rows.length : 0;
  const avgPos = rows.length ? rows.reduce((s, m) => s + (m.position || 0), 0) / rows.length : 0;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[var(--text-primary)]">Tráfego Mensal</h2>
          <GscBadge />
        </div>
        <div className="flex items-center gap-3">
          <GscUsageBadge meta={meta} />
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
            <span className="text-[var(--text-muted)] text-xs">→</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
            <button onClick={load} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]" title="Atualizar"><RefreshCw size={13} /></button>
          </div>
        </div>
      </div>

      {!gscUrl ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-amber-400">
          <AlertTriangle size={15} /> Configure a URL da propriedade GSC no cadastro do cliente para ver os dados.
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-red-400">
          <AlertTriangle size={15} /> {error}
        </div>
      ) : rows.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-px bg-[var(--border)] border-b border-[var(--border)]">
            {[
              { label: 'Cliques', value: fmtNum(totalClicks), sub: `${rows.length} meses` },
              { label: 'Impressões', value: fmtNum(totalImpr), sub: 'total' },
              { label: 'CTR Médio', value: fmtPct(avgCtr), sub: 'média' },
              { label: 'Posição Média', value: fmtPos(avgPos), sub: 'ranking' },
            ].map(k => (
              <div key={k.label} className="bg-[var(--bg-card)] p-4">
                <div className="text-xs text-[var(--text-muted)] mb-1">{k.label}</div>
                <div className="text-xl font-bold text-[var(--text-primary)] font-display">{k.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Mês</th>
                <th className="text-right px-5 py-3 font-semibold"><Tooltip content="Número de cliques no Google Search Console no período." side="bottom">Cliques <HelpCircle size={11} className="inline" /></Tooltip></th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
                <th className="text-right px-5 py-3 font-semibold">Impressões</th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
                <th className="text-right px-5 py-3 font-semibold">CTR</th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
                <th className="text-right px-5 py-3 font-semibold">Posição</th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
              </tr></thead>
              <tbody>
                {rows.map((row, i) => {
                  const prev = rows[i - 1];
                  const dClicks = delta(row.clicks, prev?.clicks);
                  const dImpr = delta(row.impressions, prev?.impressions);
                  const dCtr = delta(row.ctr, prev?.ctr);
                  const dPos = delta(row.position, prev?.position, false);
                  return (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                      <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{row.month}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(row.clicks)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono">
                        {dClicks ? <span className={dClicks.isGood ? 'text-green-400' : 'text-amber-400'}>{(dClicks.diff >= 0 ? '+' : '')}{dClicks.diff.toFixed(1)}%</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(row.impressions)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono">
                        {dImpr ? <span className={dImpr.isGood ? 'text-green-400' : 'text-amber-400'}>{(dImpr.diff >= 0 ? '+' : '')}{dImpr.diff.toFixed(1)}%</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPct(row.ctr)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono">
                        {dCtr ? <span className={dCtr.isGood ? 'text-green-400' : 'text-amber-400'}>{(dCtr.diff >= 0 ? '+' : '')}{dCtr.diff.toFixed(1)}%</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(row.position)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono">
                        {dPos ? <span className={dPos.isGood ? 'text-green-400' : 'text-amber-400'}>{(dPos.diff >= 0 ? '+' : '')}{dPos.diff.toFixed(1)}%</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--text-muted)]">
          {loading ? 'Carregando...' : 'Sem dados para o período selecionado'}
        </div>
      )}
    </div>
  );
}

// ─── Section: Pages ───────────────────────────────────────────────────────

function PagesSection({ clientId, gscUrl }: { clientId: string; gscUrl?: string }) {
  const [rows, setRows] = useState<GscPage[]>([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<GscMeta | null>(null);

  const load = async () => {
    if (!gscUrl) return;
    setLoading(true);
    setError(null);
    try {
      const u = `/api/clients/${clientId}/gsc?type=pages&from=${from}&to=${to}&limit=20`;
      const d = await fetch(u).then(r => r.json());
      if (d.error) { setError(d.error); setRows([]); }
      else { setRows(d.rows || []); setMeta({ requestsToday: d.requestsToday ?? 0, lastUpdated: d.lastUpdated ?? '' }); }
    } catch { setError('Erro de conexão'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId, from, to, gscUrl]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[var(--text-primary)]">Páginas Principais</h2>
          <GscBadge />
        </div>
        <div className="flex items-center gap-3">
          <GscUsageBadge meta={meta} />
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
            <span className="text-[var(--text-muted)] text-xs">→</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
            <button onClick={load} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]" title="Atualizar"><RefreshCw size={13} /></button>
          </div>
        </div>
      </div>

      {!gscUrl ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-amber-400">
          <AlertTriangle size={15} /> Configure a URL da propriedade GSC no cadastro do cliente para ver os dados.
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-red-400">
          <AlertTriangle size={15} /> {error}
        </div>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-semibold">URL</th>
              <th className="text-right px-5 py-3 font-semibold">Cliques</th>
              <th className="text-right px-5 py-3 font-semibold">Impressões</th>
              <th className="text-right px-5 py-3 font-semibold">CTR</th>
              <th className="text-right px-5 py-3 font-semibold">Posição</th>
            </tr></thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                  <td className="px-5 py-3 text-sm font-mono text-[var(--text-secondary)] max-w-xs truncate" title={p.pageUrl}>{p.pageUrl}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(p.clicks)}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(p.impressions)}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPct(p.ctr)}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(p.position)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--text-muted)]">
          {loading ? 'Carregando...' : 'Sem dados para o período selecionado'}
        </div>
      )}
    </div>
  );
}

// ─── Section: Queries ─────────────────────────────────────────────────────

function QueriesSection({ clientId, gscUrl }: { clientId: string; gscUrl?: string }) {
  const [rows, setRows] = useState<GscQuery[]>([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<GscMeta | null>(null);

  const load = async () => {
    if (!gscUrl) return;
    setLoading(true);
    setError(null);
    try {
      const u = `/api/clients/${clientId}/gsc?type=queries&from=${from}&to=${to}&limit=20`;
      const d = await fetch(u).then(r => r.json());
      if (d.error) { setError(d.error); setRows([]); }
      else { setRows(d.rows || []); setMeta({ requestsToday: d.requestsToday ?? 0, lastUpdated: d.lastUpdated ?? '' }); }
    } catch { setError('Erro de conexão'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId, from, to, gscUrl]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[var(--text-primary)]">Consultas Principais</h2>
          <GscBadge />
        </div>
        <div className="flex items-center gap-3">
          <GscUsageBadge meta={meta} />
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
            <span className="text-[var(--text-muted)] text-xs">→</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
            <button onClick={load} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]" title="Atualizar"><RefreshCw size={13} /></button>
          </div>
        </div>
      </div>

      {!gscUrl ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-amber-400">
          <AlertTriangle size={15} /> Configure a URL da propriedade GSC no cadastro do cliente para ver os dados.
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-red-400">
          <AlertTriangle size={15} /> {error}
        </div>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-semibold">Consulta</th>
              <th className="text-right px-5 py-3 font-semibold">Cliques</th>
              <th className="text-right px-5 py-3 font-semibold">Impressões</th>
              <th className="text-right px-5 py-3 font-semibold">CTR</th>
              <th className="text-right px-5 py-3 font-semibold">Posição</th>
            </tr></thead>
            <tbody>
              {rows.map((q, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                  <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{q.query}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(q.clicks)}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(q.impressions)}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPct(q.ctr)}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(q.position)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--text-muted)]">
          {loading ? 'Carregando...' : 'Sem dados para o período selecionado'}
        </div>
      )}
    </div>
  );
}

// ─── Section: Keywords (DB-based, unchanged) ───────────────────────────────

function KeywordsReportSection({ clientId }: { clientId: string }) {
  // Keep existing DB-based keywords section unchanged
  const [rows, setRows] = useState<{id:number;keyword:string;initial_position:number;best_position:number|null;months:Array<{month:string;position:number|null}>}[]>([]);
  const [period] = useState('all');

  useEffect(() => {
    fetch(`/api/clients/${clientId}/keywords?period=${period}`)
      .then(r => r.json())
      .then(d => setRows(d.keywords || []));
  }, [clientId, period]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
        <h2 className="font-semibold text-[var(--text-primary)]">Keywords</h2>
        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded font-medium">📝 Base de dados</span>
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--text-muted)]">Nenhuma keyword cadastrada</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-semibold">Keyword</th>
              <th className="text-right px-5 py-3 font-semibold">Inicial</th>
              <th className="text-right px-5 py-3 font-semibold">Melhor</th>
              <th className="text-right px-5 py-3 font-semibold">Atual</th>
            </tr></thead>
            <tbody>
              {rows.map(kw => (
                <tr key={kw.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                  <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{kw.keyword}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{kw.initial_position ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-green-400">{kw.best_position ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{kw.months[kw.months.length-1]?.position ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(d => setClient(d));
  }, [id]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clients/${id}`} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Relatório</h1>
          {client && <p className="text-sm text-[var(--text-muted)]">{client.name} · {client.domain}</p>}
        </div>
      </div>

      <MonthlySection clientId={id as string} gscUrl={client?.gsc_property_url} />
      <PagesSection clientId={id as string} gscUrl={client?.gsc_property_url} />
      <QueriesSection clientId={id as string} gscUrl={client?.gsc_property_url} />
      <KeywordsReportSection clientId={id as string} />
    </div>
  );
}
