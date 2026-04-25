"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";

interface Story {
  title: string; slug: string; date: string; style: string;
  context: string; theme: string; narrative: string;
  word_count: number; status: string; characters: string[];
  grey_task_id: string | null; extension: string;
  created_by: string; content: string;
}

interface Character {
  name: string; age: string; estado_civil: string; fisico: string;
  personalidade: string; preferencias: string; traços: string; como_referenciar: string;
}

const styleColors: Record<string, string> = {
  light: "#4ade80", sensual: "#facc15", heavy: "#f97316", hardcore: "#ef4444", completo: "#a855f7",
};

const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: "#9ca3af", bg: "#9ca3af20" },
  sent: { label: "📤 Enviado", color: "#facc15", bg: "#facc1520" },
  developed: { label: "✅ Desenvolvido", color: "#4ade80", bg: "#4ade8020" },
};

export default function StoryEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCharForm, setShowCharForm] = useState(false);
  const [editMeta, setEditMeta] = useState({ title: "", style: "sensual", context: "", theme: "", narrative: "terceira-pessoa", extension: "~1200 palavras", characters: [] as string[] });
  const [content, setContent] = useState("");
  const [newChar, setNewChar] = useState({ name: "", age: "", estado_civil: "", fisico: "", personalidade: "", preferencias: "", traços: "", como_referenciar: "" });

  const loadStory = useCallback(async () => {
    try {
      const [storyRes, charRes] = await Promise.all([
        fetch(`/api/erotic/stories/${slug}`),
        fetch("/api/erotic/characters"),
      ]);
      const storyData = await storyRes.json();
      const charData = await charRes.json();
      if (storyData.story) {
        const s = storyData.story;
        setStory(s);
        setEditMeta({ title: s.title, style: s.style, context: s.context || "", theme: s.theme, narrative: s.narrative, extension: s.extension || "~1200 palavras", characters: s.characters || [] });
        setContent(s.content || "");
      }
      setCharacters(charData.characters || []);
    } catch (error) {
      console.error("Error loading:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadStory(); }, [loadStory]);

  useEffect(() => {
    if (story?.status !== "sent") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/erotic/stories/${slug}`);
        const data = await res.json();
        if (data.story?.status === "developed") {
          setStory((prev) => prev ? { ...prev, status: "developed", content: data.story.content } : null);
          setContent(data.story.content || "");
          setPolling(false);
          clearInterval(interval);
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [story?.status, slug]);

  const saveMeta = async () => {
    setSaving(true);
    try {
      await fetch(`/api/erotic/stories/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMeta),
      });
      await loadStory();
      setEditMode(false);
    } catch (error) {
      console.error("Error saving meta:", error);
    } finally {
      setSaving(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      await fetch(`/api/erotic/stories/${slug}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setSaving(false);
    }
  };

  const sendToGrey = async () => {
    if (content) await saveContent();
    setSending(true);
    setPolling(true);
    try {
      await fetch(`/api/erotic/stories/${slug}/send-to-grey`, { method: "POST" });
      await loadStory();
    } catch (error) {
      console.error("Error sending to grey:", error);
      setPolling(false);
    } finally {
      setSending(false);
    }
  };

  const toggleChar = (name: string) => {
    setEditMeta((prev) => ({
      ...prev,
      characters: prev.characters.includes(name)
        ? prev.characters.filter((c) => c !== name)
        : [...prev.characters, name],
    }));
  };

  const createCharacter = async () => {
    if (!newChar.name.trim()) return;
    try {
      const res = await fetch("/api/erotic/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChar),
      });
      if (res.ok) {
        const data = await res.json();
        setCharacters((prev) => [...prev, data.character]);
        setEditMeta((prev) => ({ ...prev, characters: [...prev.characters, newChar.name] }));
        setShowCharForm(false);
        setNewChar({ name: "", age: "", estado_civil: "", fisico: "", personalidade: "", preferencias: "", traços: "", como_referenciar: "" });
      }
    } catch (error) {
      console.error("Error creating character:", error);
    }
  };

  if (loading) return <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>Carregando...</div>;
  if (!story) return <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>Conto não encontrado.</div>;

  const badge = statusBadge[story.status] || statusBadge.draft;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/erotic/stories")} className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          {editMode ? (
            <input
              value={editMeta.title}
              onChange={(e) => setEditMeta({ ...editMeta, title: e.target.value })}
              className="text-2xl font-bold bg-transparent outline-none"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", border: "none" }}
            />
          ) : (
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>{story.title}</h1>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${styleColors[story.style] || "#888"}20`, color: styleColors[story.style] || "#888" }}>{story.style}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
            {polling && <span className="text-xs" style={{ color: "var(--text-muted)" }}>⏳ Aguardando Grey...</span>}
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>{story.word_count} palavras</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancelar</button>
              <button onClick={saveMeta} disabled={saving} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>
                <Save className="w-4 h-4 inline mr-1" />{saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Editar Meta</button>
              <button onClick={saveContent} disabled={saving} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--accent)" }}>
                <Save className="w-4 h-4 inline mr-1" />{saving ? "Salvando..." : "Salvar Texto"}
              </button>
              <button onClick={sendToGrey} disabled={sending} className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105" style={{ backgroundColor: "#e879f9", color: "var(--bg)" }}>
                <Send className="w-4 h-4 inline mr-1" />{sending ? "Enviando..." : story.status === "developed" ? "Reenviar ao Grey" : "Desenvolver com Grey"}
              </button>
            </>
          )}
        </div>
      </div>

      {editMode && (
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tom</label>
                <select value={editMeta.style} onChange={(e) => setEditMeta({ ...editMeta, style: e.target.value })} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="light">Light</option><option value="sensual">Sensual</option><option value="heavy">Heavy</option><option value="hardcore">Hardcore</option><option value="completo">Completo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Narrativa</label>
                <select value={editMeta.narrative} onChange={(e) => setEditMeta({ ...editMeta, narrative: e.target.value })} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="mulher">Primeira pessoa (mulher)</option><option value="marido">Primeira pessoa (marido)</option><option value="terceira-pessoa">Terceira pessoa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tema (vírgulas)</label>
              <input type="text" value={editMeta.theme} onChange={(e) => setEditMeta({ ...editMeta, theme: e.target.value })} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Context / Synopsis</label>
              <textarea value={editMeta.context} onChange={(e) => setEditMeta({ ...editMeta, context: e.target.value })} className="w-full px-3 py-2 rounded-lg outline-none resize-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "80px" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Personagens ({editMeta.characters.length})</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {characters.map((char) => (
                  <button key={char.name} onClick={() => toggleChar(char.name)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all" style={{
                    backgroundColor: editMeta.characters.includes(char.name) ? "var(--accent)" : "var(--surface)",
                    color: editMeta.characters.includes(char.name) ? "var(--bg)" : "var(--text-secondary)",
                    border: `1px solid ${editMeta.characters.includes(char.name) ? "var(--accent)" : "var(--border)"}`,
                  }}>{char.name}</button>
                ))}
              </div>
              {showCharForm ? (
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                  <input value={newChar.name} onChange={(e) => setNewChar({ ...newChar, name: e.target.value })} placeholder="Nome" className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newChar.age} onChange={(e) => setNewChar({ ...newChar, age: e.target.value })} placeholder="Idade" className="px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <input value={newChar.estado_civil} onChange={(e) => setNewChar({ ...newChar, estado_civil: e.target.value })} placeholder="Estado civil" className="px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <textarea value={newChar.preferencias} onChange={(e) => setNewChar({ ...newChar, preferencias: e.target.value })} placeholder="Preferências sexuais" className="w-full px-3 py-2 rounded-lg outline-none resize-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "60px" }} />
                  <div className="flex gap-2">
                    <button onClick={createCharacter} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>Criar</button>
                    <button onClick={() => setShowCharForm(false)} className="px-4 py-2 rounded-lg font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowCharForm(true)} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}>+ Criar personagem</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Conteúdo</span>
          <button onClick={saveContent} disabled={saving} className="text-sm px-3 py-1 rounded-lg" style={{ color: "var(--accent)" }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-5 py-4 outline-none resize-none font-mono text-sm"
          style={{ backgroundColor: "transparent", color: "var(--text-primary)", border: "none", minHeight: "500px" }}
          placeholder="Narrativa do conto..."
        />
      </div>
    </div>
  );
}
