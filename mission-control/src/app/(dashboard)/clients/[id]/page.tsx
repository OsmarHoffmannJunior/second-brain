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

  const toggleExpand = (kwId: number) => setExpanded(e => ({ ...e, [kwId]: !e[kwId] }));

  const fmtPos = (n: number) => n % 1 === 0 ? n.toString() : n.toFixed(1);

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
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Keyword (ex: acompanhantes sp)"
              value={newKw.keyword}
              onChange={e => setNewKw(k => ({ ...k, keyword: e.target.value }))}
              className="col-span-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Posição inicial (hoje)"
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
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40"
            >
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
            const allPositions: { month: string; pos: number }[] = [];
            if (kw.initial_month && kw.initial_position) {
              allPositions.push({ month: kw.initial_month, pos: kw.initial_position });
            }
            if (kw.monthly) {
              kw.monthly.forEach(m => allPositions.push({ month: m.month, pos: m.position }));
            }
            allPositions.sort((a, b) => a.month.localeCompare(b.month));
            const current = kw.latest_position ?? kw.initial_position;
            const first = allPositions[0];
            const last = allPositions[allPositions.length - 1];
            const overallDelta = first && last ? positionDelta(last.pos, first.pos) : null;
            const isExpanded = expanded[kw.id];

            return (
              <div key={kw.id} className="border-b border-[var(--border)] last:border-0">
                <div className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-colors">
                  <button onClick={() => toggleExpand(kw.id)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">{kw.keyword}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      Início: {kw.initial_position ? `${fmtPos(kw.initial_position)} (${kw.initial_month ?? '—'})` : '—'}
                      {kw.latest_position && kw.latest_position !== kw.initial_position
                        ? ` → Atual: ${fmtPos(kw.latest_position)} (${kw.latest_month})`
                        : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {overallDelta && (
                      <span className={`text-xs font-mono font-medium ${overallDelta.isGood ? 'text-green-400' : 'text-amber-400'}`}>
                        {overallDelta.diff < 0 ? '' : '+'}{fmtPos(overallDelta.diff)} overall
                      </span>
                    )}
                    {last && (
                      <span className="text-sm font-bold font-display text-[var(--text-primary)]">{fmtPos(last.pos)}</span>
                    )}
                    <button
                      onClick={() => handleDeleteKeyword(kw.id)}
                      className="p-1 rounded hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded: monthly timeline */}
                {isExpanded && (
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-1 flex-wrap mb-3">
                      {allPositions.map((p, i) => {
                        const prev = allPositions[i - 1];
                        const d = prev ? positionDelta(p.pos, prev.pos) : null;
                        return (
                          <div key={p.month} className="flex items-center gap-1">
                            {i > 0 && (
                              <span className="text-[var(--text-muted)] text-xs mx-0.5">
                                {d ? <span className={d.isGood ? 'text-green-400' : 'text-amber-400'}>{d.diff < 0 ? '↓' : '↑'}</span> : ''}
                              </span>
                            )}
                            <div className={`px-2 py-1 rounded-lg text-xs font-mono ${i === allPositions.length - 1 ? 'bg-[var(--accent)] text-[var(--bg)] font-bold' : 'bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)]'}`}>
                              {p.month.slice(5)}: {fmtPos(p.pos)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add monthly position */}
                    {addMonthMode === kw.id ? (
                      <form onSubmit={(e) => handleAddPosition(kw.id, e)} className="flex items-center gap-2 mt-2">
                        <input
                          type="month"
                          value={newMonth}
                          onChange={e => setNewMonth(e.target.value)}
                          className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono"
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Posição"
                          value={newPosition}
                          onChange={e => setNewPosition(e.target.value)}
                          className="w-20 p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs"
                          autoFocus
                        />
                        <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40">
                          {saving ? '...' : 'Add'}
                        </button>
                        <button type="button" onClick={() => setAddMonthMode(null)} className="px-3 py-1.5 rounded-lg text-xs border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
                          ✕
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setAddMonthMode(kw.id)}
                        className="mt-2 text-xs text-[var(--accent)] hover:text-[var(--accent-light)] flex items-center gap-1"
                      >
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
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(d => { setClient(d); setLoading(false); })
      .catch(() => setLoading(false));
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
        {client.monthly_clicks_goal && <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4"><div className="text-xs text-[var(--text-muted)] mb-1">Meta Cliques</div><div className="text-sm text-[var(--text-primary)]">{client.monthly_clicks_goal.toLocaleString('pt-BR')}/mês</div></div>}
        {client.monthly_leads_goal && <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4"><div className="text-xs text-[var(--text-muted)] mb-1">Meta Leads</div><div className="text-sm text-[var(--text-primary)]">{client.monthly_leads_goal.toLocaleString('pt-BR')}/mês</div></div>}
      </div>

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
