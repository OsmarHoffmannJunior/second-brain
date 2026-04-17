'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, BarChart2, Clock, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  company?: string;
  domain: string;
  niche?: string;
  monthly_clicks_goal?: number;
  monthly_leads_goal?: number;
  main_keywords?: string;
  competitors?: string;
  imports?: ImportRecord[];
}

interface ImportRecord {
  id: number;
  import_type: string;
  period_start?: string;
  period_end?: string;
  rows_imported: number;
  created_at: string;
}

interface KeywordMonthly {
  keyword_id: number;
  month: string;
  position: number;
}

interface Keyword extends KeywordMonthly {
  id: number;
  client_id: number;
  keyword: string;
  initial_position?: number;
  initial_month?: string;
  monthly?: KeywordMonthly[];
  latest_position?: number;
  latest_month?: string;
}

const TYPE_LABELS: Record<string, string> = {
  gsc_daily: 'Tráfego Diário',
  gsc_queries: 'Queries',
  gsc_pages: 'Páginas',
  ranking: 'Rankings',
};

function positionDelta(curr: number, prev: number) {
  const diff = curr - prev;
  const isGood = diff < 0;
  return { diff, isGood };
}


function KeywordsSection({ clientId }: { clientId: string }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newKw, setNewKw] = useState({ keyword: '', initialPosition: '', initialMonth: '' });
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [addMonthMode, setAddMonthMode] = useState<number | null>(null);
  const [newMonth, setNewMonth] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [saving, setSaving] = useState(false);
  const [editMonth, setEditMonth] = useState<{ kwId: number; month: string; position: string } | null>(null);
  const [deleteMonth, setDeleteMonth] = useState<{ kwId: number; month: string } | null>(null);

  const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const load = async () => {
    setLoading(true);
    const d = await fetch(`/api/clients/${clientId}/keywords`).then(r => r.json());
    setKeywords(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKw.keyword.trim()) return;
    setSaving(true);
    await fetch(`/api/clients/${clientId}/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyword: newKw.keyword.trim(),
        initialPosition: newKw.initialPosition ? parseFloat(newKw.initialPosition) : undefined,
        initialMonth: newKw.initialMonth || undefined,
      }),
    });
    setNewKw({ keyword: '', initialPosition: '', initialMonth: '' });
    setShowAdd(false);
    setSaving(false);
    load();
  };

  const handleDeleteKeyword = async (kwId: number) => {
    if (!confirm('Remover keyword e todo histórico?')) return;
    await fetch(`/api/clients/${clientId}/keywords/${kwId}`, { method: 'DELETE' });
    load();
  };

  const handleAddPosition = async (keywordId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonth || newPosition === '') return;
    setSaving(true);
    await fetch(`/api/clients/${clientId}/keywords/${keywordId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: newMonth, position: parseFloat(newPosition) }),
    });
    setNewMonth('');
    setNewPosition('');
    setAddMonthMode(null);
    setSaving(false);
    load();
  };

  const handleSaveEdit = async (kwId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!editMonth || editMonth.position === '') return;
    setSaving(true);
    await fetch(`/api/clients/${clientId}/keywords/${kwId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: editMonth.month, position: parseFloat(editMonth.position) }),
    });
    setEditMonth(null);
    setSaving(false);
    load();
  };

  const handleDeleteMonth = async () => {
    if (!deleteMonth) return;
    setSaving(true);
    await fetch(`/api/clients/${clientId}/keywords/${deleteMonth.kwId}?month=${deleteMonth.month}`, { method: 'DELETE' });
    setDeleteMonth(null);
    setSaving(false);
    load();
  };

  const toggleExpand = (kwId: number) => setExpanded(e => ({ ...e, [kwId]: !e[kwId] }));

  const fmtPos = (n: number) => n % 1 === 0 ? n.toString() : n.toFixed(1);

  const fmtMonth = (month: string) => {
    const [y, m] = month.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1]}/${y}`;
  };

  const positionDelta = (curr: number, prev: number) => {
    const diff = curr - prev;
    const isGood = diff < 0;
    return { diff, isGood };
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-[var(--text-primary)]">Keywords</h2>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity"
        >
          <Plus size={13} /> {showAdd ? 'Cancelar' : 'Nova Keyword'}
        </button>
      </div>

      {/* Add Keyword Form */}
      {showAdd && (
        <form onSubmit={handleAddKeyword} className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-hover)] space-y-3">
          <input
            required
            placeholder="Keyword (ex: acompanhantes florianópolis)"
            value={newKw.keyword}
            onChange={e => setNewKw(k => ({ ...k, keyword: e.target.value }))}
            className="w-full p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="Posição inicial"
              value={newKw.initialPosition}
              onChange={e => setNewKw(k => ({ ...k, initialPosition: e.target.value }))}
              className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm"
            />
            <input
              type="month"
              value={newKw.initialMonth}
              onChange={e => setNewKw(k => ({ ...k, initialMonth: e.target.value }))}
              className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40">
              {saving ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      {/* Keywords List */}
      {loading ? (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">Carregando...</div>
      ) : keywords.length === 0 && !showAdd ? (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">
          Nenhuma keyword cadastrada. Clique em "Nova Keyword" para começar.
        </div>
      ) : (
        <div>
          {keywords.map(kw => {
            const initialEntry = kw.initial_month && kw.initial_position
              ? { month: kw.initial_month, pos: kw.initial_position, isInitial: true }
              : null;
            const monthlyEntries = (kw.monthly ?? []).map(m => ({ month: m.month, pos: m.position, isInitial: false }));
            const allEntries = [
              ...(initialEntry ? [initialEntry] : []),
              ...monthlyEntries,
            ].sort((a, b) => a.month.localeCompare(b.month));

            const first = allEntries[0];
            const last = allEntries[allEntries.length - 1];
            const best = allEntries.reduce((min, e) => e.pos < min ? e.pos : min, first?.pos ?? Infinity);
            const overallDelta = first && last && first.pos !== last.pos ? positionDelta(last.pos, first.pos) : null;
            const isExpanded = !!expanded[kw.id];

            return (
              <div key={kw.id} className="border-b border-[var(--border)] last:border-0">
                {/* Header row */}
                <div className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-colors">
                  <button onClick={() => toggleExpand(kw.id)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0">
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{kw.keyword}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>Início: <span className="font-mono">{kw.initial_position ? `${fmtPos(kw.initial_position)} (${fmtMonth(kw.initial_month!)})` : '—'}</span></span>
                      <span>Melhor: <span className="font-mono text-emerald-400">{best !== Infinity ? fmtPos(best) : '—'}</span></span>
                      <span>Atual: <span className="font-mono font-bold">{last ? fmtPos(last.pos) : '—'}</span></span>
                      <span>{allEntries.length} meses</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {overallDelta && (
                      <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${overallDelta.isGood ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'}`}>
                        {overallDelta.diff < 0 ? '' : '+'}{fmtPos(overallDelta.diff)}
                      </span>
                    )}
                    <button onClick={() => handleDeleteKeyword(kw.id)} className="p-1.5 rounded-lg hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-400" title="Remover keyword">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded: full table */}
                {isExpanded && (
                  <div className="px-5 pb-4">
                    {/* Table header */}
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 px-3 py-2 text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                      <div className="w-16">Mês</div>
                      <div>Posição</div>
                      <div className="w-12 text-center">Evol.</div>
                      <div className="w-20 text-right">Ações</div>
                    </div>

                    {/* Rows */}
                    {allEntries.map((entry, i) => {
                      const prev = allEntries[i - 1];
                      const delta = prev ? positionDelta(entry.pos, prev.pos) : null;
                      const isLast = i === allEntries.length - 1;
                      const isEdit = editMonth?.kwId === kw.id && editMonth?.month === entry.month;

                      return (
                        <div key={entry.month} className={`grid grid-cols-[auto_1fr_auto_auto] gap-2 px-3 py-2 items-center border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] ${isLast && entry.isInitial ? 'border-t-2 border-[var(--accent)]/50' : ''}`}>
                          {isEdit ? (
                            <>
                              <div className="w-16 text-xs font-mono text-[var(--text-muted)]">{fmtMonth(entry.month)}</div>
                              <form onSubmit={e => handleSaveEdit(kw.id, e)} className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editMonth.position}
                                  onChange={e => setEditMonth(m => m ? { ...m, position: e.target.value } : null)}
                                  className="w-20 p-1 rounded bg-[var(--bg)] border border-[var(--accent)] text-[var(--text-primary)] text-sm font-mono"
                                  autoFocus
                                />
                                <button type="submit" disabled={saving} className="text-xs px-2 py-1 rounded bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40">OK</button>
                              </form>
                              <div />
                              <button onClick={() => setEditMonth(null)} className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">✕</button>
                            </>
                          ) : (
                            <>
                              <div className="w-16 text-sm font-mono text-[var(--text-secondary)]">
                                <span className={entry.isInitial ? 'text-[var(--accent)] font-semibold' : ''}>{fmtMonth(entry.month)}</span>
                              </div>
                              <div className={`text-sm font-mono font-bold ${isLast && !entry.isInitial ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                                {entry.isInitial ? <span className="text-[var(--accent)]">{fmtPos(entry.pos)} <span className="text-xs font-normal text-[var(--text-muted)]">(início)</span></span> : fmtPos(entry.pos)}
                              </div>
                              <div className="w-12 text-center">
                                {delta ? (
                                  <span className={`text-xs font-mono ${delta.isGood ? 'text-green-400' : 'text-amber-400'}`}>
                                    {delta.diff < 0 ? '↓' : '↑'} {Math.abs(delta.diff).toFixed(0)}
                                  </span>
                                ) : <span className="text-[var(--text-muted)]">—</span>}
                              </div>
                              <div className="w-20 flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditMonth({ kwId: kw.id, month: entry.month, position: entry.pos.toString() })}
                                  className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                >
                                  Editar
                                </button>
                                {!entry.isInitial && (
                                  <button
                                    onClick={() => { setDeleteMonth({ kwId: kw.id, month: entry.month }); }}
                                    className="p-1 rounded text-red-500/60 hover:bg-red-950/30 hover:text-red-400"
                                    title="Remover este mês"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Add month row */}
                    {addMonthMode === kw.id ? (
                      <form onSubmit={e => handleAddPosition(kw.id, e)} className="flex items-center gap-2 mt-3 px-3 py-2 bg-[var(--bg-hover)] rounded-lg">
                        <input type="month" value={newMonth} onChange={e => setNewMonth(e.target.value)} className="p-1.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono" autoFocus />
                        <input type="number" step="0.1" placeholder="Posição" value={newPosition} onChange={e => setNewPosition(e.target.value)} className="w-20 p-1.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs" />
                        <button type="submit" disabled={saving} className="px-3 py-1.5 rounded text-xs font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40">{saving ? '...' : 'Add'}</button>
                        <button type="button" onClick={() => { setAddMonthMode(null); setNewMonth(''); setNewPosition(''); }} className="px-2 py-1.5 rounded text-xs border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]">✕</button>
                      </form>
                    ) : (
                      <button onClick={() => setAddMonthMode(kw.id)} className="mt-3 text-xs text-[var(--accent)] hover:text-[var(--accent-light)] flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                        <Plus size={11} /> Adicionar posição do mês
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete month confirmation */}
      {deleteMonth && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={e => e.target === e.currentTarget && setDeleteMonth(null)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Remover {fmtMonth(deleteMonth.month)}?</h3>
            <p className="text-sm text-[var(--text-muted)]">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteMonth(null)} className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">Cancelar</button>
              <button onClick={handleDeleteMonth} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-40">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ month: string; clicks: number }[]>([]);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(d => { setClient(d); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(`/api/clients/${id}/data?type=monthly`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMonthlyData(d); })
      .catch(() => {});
  }, [id]);

  if (loading) return <div className="p-6 text-[var(--text-muted)]">Carregando...</div>;
  if (!client) return <div className="p-6 text-red-400">Cliente não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{client.name}</h1>
          {client.company && <p className="text-sm text-[var(--text-muted)]">{client.company}</p>}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">Domínio</div>
          <div className="font-mono text-sm text-[var(--text-primary)]">{client.domain}</div>
        </div>
        {client.niche && <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4"><div className="text-xs text-[var(--text-muted)] mb-1">Nicho</div><div className="text-sm text-[var(--text-primary)]">{client.niche}</div></div>}
        {client.monthly_clicks_goal && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-xs text-[var(--text-muted)] mb-1">Meta Cliques/mês</div>
            <div className="text-sm text-[var(--text-primary)]">{client.monthly_clicks_goal.toLocaleString('pt-BR')}</div>
            {(() => {
              if (monthlyData.length === 0) return null;
              const goal = client.monthly_clicks_goal ?? 0;
              const bestMonth = monthlyData.reduce((best, m) => m.clicks > best.clicks ? m : best, monthlyData[0]);
              const pct = goal > 0 ? Math.round((bestMonth.clicks / goal) * 100) : 0;
              const diff = bestMonth.clicks - goal;
              const isGood = diff >= 0;
              const [y, mo] = bestMonth.month.split('-');
              const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
              const monthLabel = `${MONTH_NAMES[parseInt(mo) - 1]}/${y}`;
              return (
                <div className={`mt-2 space-y-0.5`}>
                  <div className={`text-xs font-mono ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {pct}% da meta ({diff >= 0 ? '+' : ''}{diff.toLocaleString('pt-BR')})
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Melhor mês: <span className="font-mono text-[var(--text-secondary)]">{monthLabel}</span> → <span className="font-mono font-semibold text-[var(--text-primary)]">{bestMonth.clicks.toLocaleString('pt-BR')}</span> cliques
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {client.monthly_leads_goal && <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4"><div className="text-xs text-[var(--text-muted)] mb-1">Meta Leads/mês</div><div className="text-sm text-[var(--text-primary)]">{client.monthly_leads_goal.toLocaleString('pt-BR')}</div></div>}
      </div>

      {/* Meta vs Real — last 3 months */}
      {client.monthly_clicks_goal && monthlyData.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Meta vs Tráfego Real</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Comparação dos últimos meses com a meta de {client.monthly_clicks_goal.toLocaleString('pt-BR')} cliques/mês</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Mês</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Cliques Reais</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Meta</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Atingido</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.slice(-6).reverse().map(m => {
                  const goal = client.monthly_clicks_goal ?? 0;
                  const actual = m.clicks;
                  const pct = goal > 0 ? Math.round((actual / goal) * 100) : 0;
                  const diff = actual - goal;
                  const isGood = diff >= 0;
                  const barWidth = Math.min(pct, 100);
                  const [y, mo] = m.month.split('-');
                  const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
                  const monthLabel = `${MONTH_NAMES[parseInt(mo) - 1]}/${y}`;
                  return (
                    <tr key={m.month} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                      <td className="px-5 py-3 text-sm font-mono text-[var(--text-primary)]">{monthLabel}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono font-semibold text-[var(--text-primary)]">{actual.toLocaleString('pt-BR')}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-[var(--text-muted)]">{goal.toLocaleString('pt-BR')}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-xs font-mono font-semibold ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>{pct}%</span>
                          <div className="w-20 h-1.5 rounded-full bg-[var(--bg-hover)]" style={{ overflow: 'hidden' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${barWidth}%`,
                                background: isGood ? '#10b981' : '#f59e0b',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={`px-5 py-3 text-sm text-right font-mono font-semibold ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <Link href={`/clients/${id}/import`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity">
          <Upload size={16} /> Importar Dados
        </Link>
        <Link href={`/clients/${id}/reports`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-bright)] transition-all">
          <BarChart2 size={16} /> Gerar Relatório
        </Link>
      </div>

      {/* Keywords */}
      <KeywordsSection clientId={id as string} />

      {/* Import History */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Clock size={16} />Histórico de Imports</h2>
        {!client.imports?.length ? (
          <div className="text-sm text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 text-center">Nenhum dado importado ainda</div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-[var(--border)]"><th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Tipo</th><th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Período</th><th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Registros</th><th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Data</th></tr></thead>
              <tbody>
                {client.imports.map((imp: ImportRecord) => (
                  <tr key={imp.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{TYPE_LABELS[imp.import_type] ?? imp.import_type}</td>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-secondary)]">{imp.period_start && imp.period_end ? `${imp.period_start} → ${imp.period_end}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{imp.rows_imported.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{new Date(imp.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
