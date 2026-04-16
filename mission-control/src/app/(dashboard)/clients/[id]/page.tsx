'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, BarChart2, Clock } from 'lucide-react';

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

const TYPE_LABELS: Record<string, string> = {
  gsc_daily: 'Tráfego Diário',
  gsc_queries: 'Queries',
  gsc_pages: 'Páginas',
  ranking: 'Rankings',
};

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

      {client.main_keywords && <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4"><div className="text-xs text-[var(--text-muted)] mb-2">Keywords Principais</div><div className="flex flex-wrap gap-2">{client.main_keywords.split(',').map(k => <span key={k} className="px-2 py-1 rounded-full text-xs bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{k.trim()}</span>)}</div></div>}

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <Link href={`/clients/${id}/import`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity">
          <Upload size={16} /> Importar Dados
        </Link>
        <Link href={`/clients/${id}/reports`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-bright)] transition-all">
          <BarChart2 size={16} /> Gerar Relatório
        </Link>
      </div>

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
