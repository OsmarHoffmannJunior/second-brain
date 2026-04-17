'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart2, Download } from 'lucide-react';

interface Client { id: number; name: string; domain: string; }

interface MonthlyData { month: string; clicks: number; impressions: number; ctr: number; position: number; }
interface DailyData { date: string; clicks: number; impressions: number; ctr: number; position: number; }
interface PageData { url: string; clicks: number; impressions: number; ctr: number; position: number; }
interface QueryData { query: string; clicks: number; impressions: number; ctr: number; position: number; }

export default function ReportsPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [pages, setPages] = useState<PageData[]>([]);
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(d => { setClient(d); setLoading(false); });
  }, [id]);

  const loadData = async (fromDate?: string, toDate?: string) => {
    setLoading(true);
    const baseMonthly = `/api/clients/${id}/data?type=monthly`;
    const monthlyUrl = fromDate && toDate ? `${baseMonthly}&from=${fromDate}&to=${toDate}` : baseMonthly;
    const [m, p, q] = await Promise.all([
      fetch(monthlyUrl).then(r => r.json()),
      fetch(`/api/clients/${id}/data?type=pages&limit=30`).then(r => r.json()),
      fetch(`/api/clients/${id}/data?type=queries&limit=30`).then(r => r.json()),
    ]);
    setMonthly(Array.isArray(m) ? m : []);
    setPages(Array.isArray(p) ? p : []);
    setQueries(Array.isArray(q) ? q : []);
    setHasData(Array.isArray(m) && m.length > 0);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const handleGenerate = () => { loadData(from || undefined, to || undefined); };

  const fmtNum = (n: number) => n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString('pt-BR');
  const fmtFull = (n: number) => n.toLocaleString('pt-BR');
  const fmtPct = (n: number) => n.toFixed(2)+'%';
  const fmtPos = (n: number) => n.toFixed(2);

  const totalClicks = monthly.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalImpr = monthly.reduce((s, m) => s + (m.impressions || 0), 0);
  const avgCtr = monthly.length ? monthly.reduce((s, m) => s + (m.ctr || 0), 0) / monthly.length : 0;
  const avgPos = monthly.length ? monthly.reduce((s, m) => s + (m.position || 0), 0) / monthly.length : 0;

  if (loading && !client) return <div className="p-6 text-[var(--text-muted)]">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clients/${id}`} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Relatório</h1>
          <p className="text-sm text-[var(--text-muted)]">{client?.name} &middot; {client?.domain}</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-end gap-4 flex-wrap bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">De</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Até</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono" />
        </div>
        <button onClick={handleGenerate} disabled={loading} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40 transition-opacity">
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>

      {!hasData ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <BarChart2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">Sem dados para exibir</p>
          <p className="text-sm">Importe os CSVs do GSC primeiro na aba "Importar Dados"</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Cliques Totais</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] font-display">{fmtNum(totalClicks)}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{monthly.length} meses</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Impressões</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] font-display">{fmtNum(totalImpr)}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">total no período</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">CTR Médio</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] font-display">{fmtPct(avgCtr)}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">média do período</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Posição Média</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] font-display">{fmtPos(avgPos)}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">ranking médio</div>
            </div>
          </div>

          {/* Monthly table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--text-primary)]">Resumo Mensal</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Mês</th>
                  <th className="text-right px-5 py-3 font-semibold">Cliques</th>
                  <th className="text-right px-5 py-3 font-semibold">Impressões</th>
                  <th className="text-right px-5 py-3 font-semibold">CTR</th>
                  <th className="text-right px-5 py-3 font-semibold">Posição</th>
                </tr></thead>
                <tbody>
                  {monthly.map((row, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                      <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{row.month}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(row.clicks)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(row.impressions)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPct(row.ctr)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(row.position)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Pages */}
          {pages.length > 0 && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]"><h2 className="font-semibold text-[var(--text-primary)]">Top 20 Páginas</h2></div>
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">#</th><th className="text-left px-5 py-3 font-semibold">URL</th>
                  <th className="text-right px-5 py-3 font-semibold">Cliques</th><th className="text-right px-5 py-3 font-semibold">Impr.</th>
                  <th className="text-right px-5 py-3 font-semibold">CTR</th><th className="text-right px-5 py-3 font-semibold">Pos</th>
                </tr></thead>
                <tbody>
                  {pages.slice(0, 20).map((p, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                      <td className="px-5 py-3 text-xs font-mono text-[var(--text-muted)]">{i+1}</td>
                      <td className="px-5 py-3 text-xs font-mono text-[var(--text-secondary)] max-w-[300px] truncate">{p.url.replace('https://','').replace('http://','')}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(p.clicks)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(p.impressions)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--accent-light)]">{fmtPct(p.ctr)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(p.position)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top Queries */}
          {queries.length > 0 && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]"><h2 className="font-semibold text-[var(--text-primary)]">Top 20 Queries</h2></div>
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">#</th><th className="text-left px-5 py-3 font-semibold">Query</th>
                  <th className="text-right px-5 py-3 font-semibold">Cliques</th><th className="text-right px-5 py-3 font-semibold">Impr.</th>
                  <th className="text-right px-5 py-3 font-semibold">CTR</th><th className="text-right px-5 py-3 font-semibold">Pos</th>
                </tr></thead>
                <tbody>
                  {queries.slice(0, 20).map((q, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                      <td className="px-5 py-3 text-xs font-mono text-[var(--text-muted)]">{i+1}</td>
                      <td className="px-5 py-3 text-sm text-[var(--text-primary)] max-w-[300px] truncate">{q.query}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(q.clicks)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtFull(q.impressions)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--accent-light)]">{fmtPct(q.ctr)}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{fmtPos(q.position)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
