"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Save, Eye, Edit3 } from "lucide-react";

interface Story {
  title: string;
  slug: string;
  date: string;
  style: string;
  theme: string;
  narrative: string;
  word_count: number;
  status: string;
  characters: string[];
  grey_task_id: string | null;
  created_by: string;
  content: string;
}

interface Character {
  name: string;
  age: string;
  estado_civil: string;
  fisico: string;
  personalidade: string;
  preferencias: string;
  traços: string;
  como_referenciar: string;
}

const styleColors: Record<string, string> = {
  light: "#4ade80",
  sensual: "#facc15",
  heavy: "#f97316",
  hardcore: "#ef4444",
};

export default function StorySlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [story, setStory] = useState<Story | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [editMeta, setEditMeta] = useState({
    title: "",
    theme: "",
    style: "sensual",
    narrative: "terceira-pessoa",
    characters: [] as string[],
  });
  const [content, setContent] = useState("");

  const loadStory = useCallback(async () => {
    try {
      const [storyRes, charRes] = await Promise.all([
        fetch(`/api/erotic/stories/${slug}`),
        fetch("/api/erotic/characters"),
      ]);
      const storyData = await storyRes.json();
      const charData = await charRes.json();
      if (storyData.story) {
        setStory(storyData.story);
        setEditMeta({
          title: storyData.story.title,
          theme: storyData.story.theme,
          style: storyData.story.style,
          narrative: storyData.story.narrative,
          characters: storyData.story.characters || [],
        });
        setContent(storyData.story.content || "");
      }
      setCharacters(charData.characters || []);
    } catch (error) {
      console.error("Error loading story:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  const saveMeta = async () => {
    setSaving(true);
    try {
      await fetch(`/api/erotic/stories/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMeta),
      });
      await loadStory();
      setEditing(false);
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
    if (story?.content) await saveContent();
    setSending(true);
    try {
      await fetch(`/api/erotic/stories/${slug}/send-to-grey`, { method: "POST" });
      await loadStory();
    } catch (error) {
      console.error("Error sending to grey:", error);
    } finally {
      setSending(false);
    }
  };

  const toggleCharacter = (name: string) => {
    setEditMeta((prev) => ({
      ...prev,
      characters: prev.characters.includes(name)
        ? prev.characters.filter((c) => c !== name)
        : [...prev.characters, name],
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse" style={{ color: "var(--text-muted)" }}>Carregando...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: "var(--text-muted)" }}>Conto não encontrado.</p>
        <button onClick={() => router.push("/erotic/stories")} className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/erotic/stories")}
          className="p-2 rounded-lg transition-all hover:scale-110"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          {editing ? (
            <input
              value={editMeta.title}
              onChange={(e) => setEditMeta({ ...editMeta, title: e.target.value })}
              className="text-2xl font-bold bg-transparent outline-none"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", border: "none" }}
            />
          ) : (
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-1px" }}
            >
              {story.title}
            </h1>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${styleColors[story.style] || "#888"}20`,
                color: styleColors[story.style] || "#888",
              }}
            >
              {story.style}
            </span>
            {story.status === "sent" && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#facc1520", color: "#facc15" }}>
                📤 Enviado ao Grey
              </span>
            )}
            {story.status === "developed" && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#4ade8020", color: "#4ade80" }}>
                ✅ Desenvolvido
              </span>
            )}
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {story.word_count} palavras
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Cancelar
              </button>
              <button onClick={saveMeta} disabled={saving} className="px-3 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>
                <Save className="w-4 h-4 inline mr-1" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <Edit3 className="w-4 h-4 inline mr-1" />
                Editar
              </button>
              <button
                onClick={sendToGrey}
                disabled={sending}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{ backgroundColor: "#e879f9", color: "var(--bg)" }}
              >
                <Send className="w-4 h-4 inline mr-1" />
                {sending ? "Enviando..." : "Enviar ao Grey"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editable meta */}
      {editing && (
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Tema (vírgulas)
              </label>
              <input
                type="text"
                value={editMeta.theme}
                onChange={(e) => setEditMeta({ ...editMeta, theme: e.target.value })}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tom</label>
                <select
                  value={editMeta.style}
                  onChange={(e) => setEditMeta({ ...editMeta, style: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="light">Light</option>
                  <option value="sensual">Sensual</option>
                  <option value="heavy">Heavy</option>
                  <option value="hardcore">Hardcore</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Narrativa</label>
                <select
                  value={editMeta.narrative}
                  onChange={(e) => setEditMeta({ ...editMeta, narrative: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="mulher">Primeira pessoa (mulher)</option>
                  <option value="marido">Primeira pessoa (marido)</option>
                  <option value="terceira-pessoa">Terceira pessoa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Personagens ({editMeta.characters.length} selecionados)
              </label>
              <div className="flex flex-wrap gap-2">
                {characters.map((char) => {
                  const selected = editMeta.characters.includes(char.name);
                  return (
                    <button
                      key={char.name}
                      onClick={() => toggleCharacter(char.name)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selected ? "var(--accent)" : "var(--surface)",
                        color: selected ? "var(--bg)" : "var(--text-secondary)",
                        border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                      }}
                    >
                      {char.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content editor */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Conteúdo Narrativo
          </span>
          <button onClick={saveContent} disabled={saving} className="text-sm px-3 py-1 rounded-lg transition-all" style={{ color: "var(--accent)" }}>
            {saving ? "Salvando..." : "Salvar conteúdo"}
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-5 py-4 outline-none resize-none font-mono text-sm"
          style={{
            backgroundColor: "transparent",
            color: "var(--text-primary)",
            border: "none",
            minHeight: "500px",
          }}
          placeholder="Narrativa do conto..."
        />
      </div>
    </div>
  );
}