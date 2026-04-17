'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink, Trash2, Edit2, Globe, Target, Users, Search, BarChart2 } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';

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
  notes?: string;
  created_at?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', domain: '', niche: '', monthly_clicks_goal: '', monthly_leads_goal: '', main_keywords: '', competitors: '', notes: '' });
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
      name: form.name,
      company: form.company || null,
      domain: form.domain,
      niche: form.niche || null,
      monthly_clicks_goal: form.monthly_clicks_goal ? parseInt(form.monthly_clicks_goal) : null,
      monthly_leads_goal: form.monthly_leads_goal ? parseInt(form.monthly_leads_goal) : null,
      main_keywords: form.main_keywords || null,
      competitors: form.competitors || null,
      notes: form.notes || null,
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
      setForm({ name: '', company: '', domain: '', niche: '', monthly_clicks_goal: '', monthly_leads_goal: '', main_keywords: '', competitors: '', notes: '' });
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
      notes: c.notes ?? '',
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
          onClick={() => { setEditingId(null); setForm({ name: '', company: '', domain: '', niche: '', monthly_clicks_goal: '', monthly_leads_goal: '', main_keywords: '', competitors: '', notes: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-xl overflow-hidden">
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', opacity: 0.15 }}>
                  <Globe size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    {editingId ? 'Editar Cliente' : 'Novo Cliente'}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {editingId ? 'Atualize os dados do cliente' : 'Adicione um novo projeto ao portfólio'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                {/* Nome + Empresa */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Nome do Cliente" required>
                    <input
                      required
                      placeholder="Ex: Santtas"
                      className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Empresa" optional>
                    <input
                      placeholder="Razão social ou marca"
                      className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    />
                  </FormField>
                </div>

                {/* Domínio + Nicho */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Domínio" required hint="Domínio principal do projeto (ex: exemplo.com.br)">
                    <input
                      required
                      placeholder="exemplo.com.br"
                      className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono focus:border-[var(--accent)] focus:outline-none transition-colors"
                      value={form.domain}
                      onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Nicho" optional>
                    <input
                      placeholder="Área de atuação"
                      className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                      value={form.niche}
                      onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
                    />
                  </FormField>
                </div>

                {/* Metas */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={13} className="text-[var(--accent)]" />
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Metas Mensais</span>
                    <span className="text-xs text-[var(--text-muted)] italic">(opcionais — usadas para comparar com o tráfego real)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Meta de Cliques" optional hint="Meta mensal de cliques no Google">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition-colors pr-14"
                          value={form.monthly_clicks_goal}
                          onChange={e => setForm(f => ({ ...f, monthly_clicks_goal: e.target.value }))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">cliques</span>
                      </div>
                    </FormField>
                    <FormField label="Meta de Leads" optional hint="Meta mensal de leads/conversões">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition-colors pr-12"
                          value={form.monthly_leads_goal}
                          onChange={e => setForm(f => ({ ...f, monthly_leads_goal: e.target.value }))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">leads</span>
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* Anotações, Keywords, Concorrentes */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Anotações" optional hint="Suporta markdown: **negrito**, *itálico*, `código`, [links](url).">
                    <textarea
                      rows={3}
                      placeholder="Anotações rápidas..."
                      className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono focus:border-[var(--accent)] focus:outline-none transition-colors resize-y"
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Keywords Principais" optional hint="Separadas por vírgula.">
                    <input
                      placeholder="acompanhantes florianópolis, acompanhantes Blumenau..."
                      className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                      value={form.main_keywords}
                      onChange={e => setForm(f => ({ ...f, main_keywords: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Concorrentes" optional hint="Domínios separados por vírgula.">
                    <input
                      placeholder="concorrente1.com.br, concorrente2.com.br"
                      className="w-full p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono focus:border-[var(--accent)] focus:outline-none transition-colors"
                      value={form.competitors}
                      onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))}
                    />
                  </FormField>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-lg text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/20"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Cliente'}
                </button>
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
