'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Client { id: number; name: string; domain: string; }

const IMPORT_TYPES = [
  { value: 'gsc_daily', label: 'Tráfego Diário (GSC)', desc: 'CSV do Gráfico 2 — dados por dia (Data, Cliques, Impressões, CTR, Posição)' },
  { value: 'gsc_queries', label: 'Queries (GSC)', desc: 'CSV de Consultas — queries por volume (Top consultas, Cliques, Impressões, CTR, Posição)' },
  { value: 'gsc_pages', label: 'Páginas (GSC)', desc: 'CSV de Páginas — URLs por cliques (Páginas principais, Cliques, Impressões, CTR, Posição)' },
];

export default function ImportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [importType, setImportType] = useState('gsc_daily');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(d => setClient(d));
  }, [id]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.trim().split('\n').slice(0, 6);
      setPreview(lines.map(l => l.split(',').map(v => v.trim().replace(/^"|"$/g, ''))));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) { setStatus('error'); setMessage('Selecione um arquivo CSV.'); return; }

    setStatus('loading');
    const text = await csvFile.text();
    const res = await fetch(`/api/clients/${id}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ importType, csv: text, periodStart: periodStart || undefined, periodEnd: periodEnd || undefined }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setMessage(`${data.rowsImported.toLocaleString('pt-BR')} registros importados com sucesso.`);
      setPreview([]);
      setCsvFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } else {
      setStatus('error');
      setMessage(data.error || 'Erro ao importar.');
    }
  };

  if (!client) return <div className="p-6 text-[var(--text-muted)]">Carregando...</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={`/clients/${id}`} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Importar Dados</h1>
          <p className="text-sm text-[var(--text-muted)]">{client.name} &middot; {client.domain}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Import Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Tipo de Dados</label>
          <div className="grid gap-3">
            {IMPORT_TYPES.map(t => (
              <label key={t.value} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${importType === t.value ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] hover:border-[var(--border-bright)] bg-[var(--bg-card)]'}`}>
                <input type="radio" name="importType" value={t.value} checked={importType === t.value} onChange={() => setImportType(t.value)} className="mt-0.5 accent-[var(--accent)]" />
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{t.label}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Period */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Data Início</label>
            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Data Fim</label>
            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono" />
          </div>
        </div>

        {/* CSV Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Arquivo CSV</label>
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:border-[var(--accent)] transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <FileText size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
            {csvFile ? (
              <div className="text-sm text-[var(--text-primary)] font-medium">{csvFile.name}</div>
            ) : (
              <>
                <div className="text-sm text-[var(--text-secondary)]">Clique para selecionar ou arraste o CSV aqui</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Suporta CSV exportado do Google Search Console</div>
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Preview (primeiras 5 linhas)</div>
            <div className="overflow-x-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {preview[0].map((h, i) => <th key={i} className="px-3 py-2 text-left text-[var(--text-muted)] font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-b border-[var(--border)] last:border-0">
                      {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-[var(--text-secondary)] truncate max-w-[150px]">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status */}
        {status !== 'idle' && (
          <div className={`flex items-center gap-2 p-4 rounded-xl text-sm ${status === 'success' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900' : status === 'error' ? 'bg-red-950/30 text-red-400 border border-red-900' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
            {status === 'success' ? <CheckCircle size={16} /> : status === 'error' ? <AlertCircle size={16} /> : null}
            {status === 'loading' ? 'Importando...' : message}
          </div>
        )}

        <button
          type="submit"
          disabled={!csvFile || status === 'loading'}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          <Upload size={16} /> {status === 'loading' ? 'Importando...' : 'Importar CSV'}
        </button>
      </form>
    </div>
  );
}
