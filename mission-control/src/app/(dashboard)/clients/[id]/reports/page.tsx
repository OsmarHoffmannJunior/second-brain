'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart2, Target } from 'lucide-react';

interface Client { id: number; name: string; domain: string; }

interface MonthlyData { month: string; clicks: number; impressions: number; ctr: number; position: number; }
interface PageData { url: string; clicks: number; impressions: number; ctr: number; position: number; period_start?: string; period_end?: string; }
interface QueryData { query: string; clicks: number; impressions: number; ctr: number; position: number; period_start?: string; period_end?: string; }

// ─── Shared helpers ───────────────────────────────────────────────────────

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

// ─── Section: Monthly Traffic ────────────────────────────────────────────

function MonthlySection({ clientId }: { clientId: string }) {
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let url = `/api/clients/${clientId}/data?type=monthly`;
    if (from && to) url += `&from=${from}&to=${to}`;
    const d = await fetch(url).then(r => r.json());
    setMonthly(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId, from, to]);

  const totalClicks = monthly.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalImpr = monthly.reduce((s, m) => s + (m.impressions || 0), 0);
  const avgCtr = monthly.length ? monthly.reduce((s, m) => s + (m.ctr || 0), 0) / monthly.length : 0;
  const avgPos = monthly.length ? monthly.reduce((s, m) => s + (m.position || 0), 0) / monthly.length : 0;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-[var(--text-primary)]">Tráfego Mensal</h2>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
          <span className="text-[var(--text-muted)] text-xs">→</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
</div>
      </div>

      {monthly.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-px bg-[var(--border)] border-b border-[var(--border)]">
            {[
              { label: 'Cliques', value: fmtNum(totalClicks), sub: `${monthly.length} meses` },
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
                <th className="text-right px-5 py-3 font-semibold">Cliques</th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
                <th className="text-right px-5 py-3 font-semibold">Impressões</th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
                <th className="text-right px-5 py-3 font-semibold">CTR</th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
                <th className="text-right px-5 py-3 font-semibold">Posição</th>
                <th className="text-right px-5 py-3 font-semibold">vs Mês Ant.</th>
              </tr></thead>
              <tbody>
                {monthly.map((row, i) => {
                  const prev = monthly[i - 1];
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
          {loading ? 'Carregando...' : 'Sem dados — importe CSV de tráfego primeiro'}
        </div>
      )}
    </div>
  );
}

// ─── Section: Pages ───────────────────────────────────────────────────────

function PagesSection({ clientId }: { clientId: string }) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let url = `/api/clients/${clientId}/data?type=pages&limit=30`;
    if (periodStart && periodEnd) url += `&periodStart=${periodStart}&periodEnd=${periodEnd}`;
    const d = await fetch(url).then(r => r.json());
    setPages(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId, periodStart, periodEnd]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-[var(--text-primary)]">Top 20 Páginas</h2>
        <div className="flex items-center gap-2">
          <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} placeholder="Início" className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
          <span className="text-[var(--text-muted)] text-xs">→</span>
          <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} placeholder="Fim" className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
</div>
      </div>
      {pages.length > 0 ? (
        <table className="w-full">
          <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
            <th className="text-left px-5 py-3 font-semibold w-8">#</th>
            <th className="text-left px-5 py-3 font-semibold">URL</th>
            <th className="text-right px-5 py-3 font-semibold">Cliques</th>
            <th className="text-right px-5 py-3 font-semibold">Impr.</th>
            <th className="text-right px-5 py-3 font-semibold">CTR</th>
            <th className="text-right px-5 py-3 font-semibold">Pos</th>
          </tr></thead>
          <tbody>
            {pages.slice(0, 20).map((p, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                <td className="px-5 py-3 text-xs font-mono text-[var(--text-muted)]">{i+1}</td>
                <td className="px-5 py-3 text-xs font-mono text-[var(--text-secondary)] max-w-[280px] truncate">{p.url.replace('https://','').replace('http://','')}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(p.clicks)}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(p.impressions)}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--accent-light)]">{fmtPct(p.ctr)}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(p.position)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--text-muted)]">
          {loading ? 'Carregando...' : 'Sem dados — importe CSV de páginas primeiro'}
        </div>
      )}
    </div>
  );
}

// ─── Section: Queries ─────────────────────────────────────────────────────

function QueriesSection({ clientId }: { clientId: string }) {
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let url = `/api/clients/${clientId}/data?type=queries&limit=30`;
    if (periodStart && periodEnd) url += `&periodStart=${periodStart}&periodEnd=${periodEnd}`;
    const d = await fetch(url).then(r => r.json());
    setQueries(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId, periodStart, periodEnd]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-[var(--text-primary)]">Top 20 Queries</h2>
        <div className="flex items-center gap-2">
          <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} placeholder="Início" className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
          <span className="text-[var(--text-muted)] text-xs">→</span>
          <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} placeholder="Fim" className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
</div>
      </div>
      {queries.length > 0 ? (
        <table className="w-full">
          <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
            <th className="text-left px-5 py-3 font-semibold w-8">#</th>
            <th className="text-left px-5 py-3 font-semibold">Query</th>
            <th className="text-right px-5 py-3 font-semibold">Cliques</th>
            <th className="text-right px-5 py-3 font-semibold">Impr.</th>
            <th className="text-right px-5 py-3 font-semibold">CTR</th>
            <th className="text-right px-5 py-3 font-semibold">Pos</th>
          </tr></thead>
          <tbody>
            {queries.slice(0, 20).map((q, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                <td className="px-5 py-3 text-xs font-mono text-[var(--text-muted)]">{i+1}</td>
                <td className="px-5 py-3 text-sm text-[var(--text-primary)] max-w-[280px] truncate">{q.query}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(q.clicks)}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(q.impressions)}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--accent-light)]">{fmtPct(q.ctr)}</td>
                <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(q.position)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--text-muted)]">
          {loading ? 'Carregando...' : 'Sem dados — importe CSV de consultas primeiro'}
        </div>
      )}
    </div>
  );
}

// ─── Section: Keywords Report ───────────────────────────────────────────

interface KwReport {
  id: number;
  keyword: string;
  initial_position: number | null;
  initial_month?: string;
  best_position: number | null;
  recent_position: number | null;
  recent_month?: string;
  data_points: number;
}

function KeywordsReportSection({ clientId }: { clientId: string }) {
  const [keywords, setKeywords] = useState<KwReport[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'best' | 'recent' | 'gain'>('best');

  const load = async () => {
    setLoading(true);
    let url = `/api/clients/${clientId}/keywords`;
    const qs: string[] = [];
    if (from) qs.push(`from=${from}`);
    if (to) qs.push(`to=${to}`);
    if (qs.length) url += '?' + qs.join('&');
    const d = await fetch(url).then(r => r.json());
    setKeywords(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId, from, to]);

  const sorted = [...keywords].sort((a, b) => {
    if (sortBy === 'best') return (a.best_position ?? 999) - (b.best_position ?? 999);
    if (sortBy === 'recent') return (a.recent_position ?? 999) - (b.recent_position ?? 999);
    // gain: (initial - recent) descending
    const gainA = (a.initial_position ?? 0) - (a.recent_position ?? a.initial_position ?? 0);
    const gainB = (b.initial_position ?? 0) - (b.recent_position ?? b.initial_position ?? 0);
    return gainB - gainA;
  });

  const fmtPos = (n: number | null) => n !== null ? (n % 1 === 0 ? n.toString() : n.toFixed(1)) : '—';

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2"><Target size={16} /> Keywords</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">De</span>
          <input type="month" value={from} onChange={e => setFrom(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
          <span className="text-xs text-[var(--text-muted)]">Até</span>
          <input type="month" value={to} onChange={e => setTo(e.target.value)} className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs"
        >
          <option value="best">Ordenar: melhor posição</option>
          <option value="recent">Ordenar: posição recente</option>
          <option value="gain">Ordenar: maior ganho</option>
        </select>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">Carregando...</div>
      ) : sorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">
          Nenhuma keyword cadastrada. Cadastre em /clients na aba de keywords.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Keyword</th>
                <th className="text-right px-5 py-3 font-semibold">Inicial</th>
                <th className="text-right px-5 py-3 font-semibold">Melhor (hist.)</th>
                <th className="text-right px-5 py-3 font-semibold">Recente</th>
                <th className="text-right px-5 py-3 font-semibold">Evolução</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(kw => {
                const gain = kw.initial_position != null && kw.recent_position != null
                  ? kw.initial_position - kw.recent_position
                  : null;
                const gainPositive = gain != null && gain > 0;
                const gainNegative = gain != null && gain < 0;
                const hasData = kw.data_points > 0;
                return (
                  <tr key={kw.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-5 py-3 text-sm text-[var(--text-primary)] max-w-[220px] truncate">{kw.keyword}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-muted)]">{fmtPos(kw.initial_position)}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono font-bold text-emerald-400">{fmtPos(kw.best_position)}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)] font-medium">
                      {fmtPos(kw.recent_position)}
                      {kw.recent_month && <span className="text-[var(--text-muted)] text-xs ml-1">({kw.recent_month.slice(5)})</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-mono">
                      {gain !== null ? (
                        <span className={gainPositive ? 'text-green-400' : gainNegative ? 'text-amber-400' : 'text-[var(--text-muted)]'}>
                          {gainPositive ? '+' : ''}{gain}
                        </span>
                      ) : <span className="text-[var(--text-muted)]">—</span>}
                    </td>
                  </tr>
                );
              })}
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
          {client && <p className="text-sm text-[var(--text-muted)]">{client.name} &middot; {client.domain}</p>}
        </div>
      </div>

      <MonthlySection clientId={id as string} />
      <PagesSection clientId={id as string} />
      <QueriesSection clientId={id as string} />
      <KeywordsReportSection clientId={id as string} />
    </div>
  );
}
