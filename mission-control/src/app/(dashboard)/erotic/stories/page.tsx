"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Eye, Edit3, Trash2, Send } from "lucide-react";

interface StoryMeta {
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
}

const styleColors: Record<string, string> = {
  light: "#4ade80",
  sensual: "#facc15",
  heavy: "#f97316",
  hardcore: "#ef4444",
};

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newStory, setNewStory] = useState({
    title: "",
    theme: "",
    style: "sensual",
    narrative: "terceira-pessoa",
    characters: [] as string[],
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/erotic/stories");
      const data = await res.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async () => {
    if (!newStory.title.trim()) return;
    try {
      const res = await fetch("/api/erotic/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStory),
      });
      const data = await res.json();
      if (data.story) {
        router.push(`/erotic/stories/${data.story.slug}`);
      }
    } catch (error) {
      console.error("Error creating story:", error);
    }
  };

  const deleteStory = async (slug: string) => {
    if (!confirm("Remover este conto?")) return;
    try {
      await fetch(`/api/erotic/stories/${slug}`, { method: "DELETE" });
      fetchStories();
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse" style={{ color: "var(--text-muted)" }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-1.5px" }}
          >
            <BookOpen className="inline-block w-8 h-8 mr-2 mb-1" style={{ color: "#e879f9" }} />
            Stories
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            {stories.length} contos • Agent Grey
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
        >
          <Plus className="w-4 h-4" />
          Novo Conto
        </button>
      </div>

      {/* New story form */}
      {showNewForm && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Criar Novo Conto
          </h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Título
              </label>
              <input
                type="text"
                value={newStory.title}
                onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="Título do conto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Tema (tags separadas por vírgula)
              </label>
              <input
                type="text"
                value={newStory.theme}
                onChange={(e) => setNewStory({ ...newStory, theme: e.target.value })}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="hotwife, anal, corno manso..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Tom
                </label>
                <select
                  value={newStory.style}
                  onChange={(e) => setNewStory({ ...newStory, style: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="light">Light</option>
                  <option value="sensual">Sensual</option>
                  <option value="heavy">Heavy</option>
                  <option value="hardcore">Hardcore</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Narrativa
                </label>
                <select
                  value={newStory.narrative}
                  onChange={(e) => setNewStory({ ...newStory, narrative: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="mulher">Primeira pessoa (mulher)</option>
                  <option value="marido">Primeira pessoa (marido)</option>
                  <option value="terceira-pessoa">Terceira pessoa</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                Cancelar
              </button>
              <button
                onClick={createStory}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stories list */}
      {stories.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Nenhum conto ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {stories.map((story) => (
            <div
              key={story.slug}
              className="rounded-xl p-5 transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-lg font-semibold"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                    >
                      {story.title}
                    </h3>
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
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
                    <span>{story.date}</span>
                    <span>{story.narrative.replace("-", " ")}</span>
                    <span>{story.word_count} palavras</span>
                  </div>
                  {story.characters.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {story.characters.map((char) => (
                        <span
                          key={char}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: "var(--surface)", color: "var(--text-secondary)" }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  )}
                  {story.theme && (
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      {story.theme}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/erotic/stories/${story.slug}`)}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ color: "var(--text-secondary)" }}
                    title="Visualizar / Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteStory(story.slug)}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ color: "#ef4444" }}
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}