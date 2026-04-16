'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink, Trash2, Edit2 } from 'lucide-react';

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
  created_at?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', domain: '', niche: '', monthly_clicks_goal: '', monthly_leads_goal: '', main_keywords: '', competitors: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const res = await fetch('/api/clients');
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      monthly_clicks_goal: form.monthly_clicks_goal ? parseInt(form.monthly_clicks_goal) : undefined,
      monthly_leads_goal: form.monthly_leads_goal ? parseInt(form.monthly_leads_goal) : undefined,
    };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/clients/${editingId}` : '/api/clients';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', company: '', domain: '', niche: '', monthly_clicks_goal: '', monthly_leads_goal: '', main_keywords: '', competitors: '' });
      fetchClients();
    }
  };

  const handleEdit = (c: Client) => {
    setForm({
      name: c.name,
      company: c.company ?? '',
      domain: c.domain,
      niche: c.niche ?? '',
      monthly_clicks_goal: c.monthly_clicks_goal?.toString() ?? '',
      monthly_leads_goal: c.monthly_leads_goal?.toString() ?? '',
      main_keywords: c.main_keywords ?? '',
      competitors: c.competitors ?? '',
    });
    setEditingId(c.id ?? null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover cliente e todos os dados? Esta ação não pode ser desfeita.')) return;
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (res.ok) fetchClients();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Clientes SEO</h1>
        <button
          onClick={() => { setEditingId(null); setForm({ name: '', company: '', domain: '', niche: '', monthly_clicks_goal: '', monthly_leads_goal: '', main_keywords: '', competitors: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Nome *" className="col-span-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input placeholder="Empresa" className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                <input required placeholder="Domínio (ex: exemplo.com.br) *" className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} />
                <input placeholder="Nicho" className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))} />
                <input placeholder="Meta cliques/mês" type="number" className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.monthly_clicks_goal} onChange={e => setForm(f => ({ ...f, monthly_clicks_goal: e.target.value }))} />
                <input placeholder="Meta leads/mês" type="number" className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.monthly_leads_goal} onChange={e => setForm(f => ({ ...f, monthly_leads_goal: e.target.value }))} />
                <input placeholder="Keywords principais (separadas por vírgula)" className="col-span-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.main_keywords} onChange={e => setForm(f => ({ ...f, main_keywords: e.target.value }))} />
                <input placeholder="Concorrentes (separados por vírgula)" className="col-span-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm" value={form.competitors} onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90">{editingId ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      {loading ? (
        <div className="text-[var(--text-muted)] text-sm">Carregando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-lg mb-2">Nenhum cliente ainda</p>
          <p className="text-sm">Clique em "Novo Cliente" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => (
            <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-bright)] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{c.name}</h3>
                  {c.company && <p className="text-xs text-[var(--text-muted)]">{c.company}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <ExternalLink size={11} />
                  <span className="font-mono">{c.domain}</span>
                </div>
                {c.niche && <div className="text-xs text-[var(--text-muted)]">{c.niche}</div>}
                {c.monthly_clicks_goal && <div className="text-xs text-[var(--text-muted)]">Meta: {c.monthly_clicks_goal.toLocaleString('pt-BR')} cliques/mês</div>}
              </div>
              <div className="flex gap-2">
                <Link href={`/clients/${c.id}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-all">Ver detalhes</Link>
                <Link href={`/clients/${c.id}/import`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity">Importar CSV</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
