"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, Users, BookOpen, TrendingUp } from "lucide-react";

interface StoryMeta {
  title: string;
  slug: string;
  date: string;
  style: string;
  status: string;
  word_count: number;
  characters: string[];
}

const styleColors: Record<string, string> = {
  light: "#4ade80",
  sensual: "#facc15",
  heavy: "#f97316",
  hardcore: "#ef4444",
};

const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: "#9ca3af", bg: "#9ca3af20" },
  sent: { label: "📤 Enviado", color: "#facc15", bg: "#facc1520" },
  developed: { label: "✅ Desenvolvido", color: "#4ade80", bg: "#4ade8020" },
};

export default function EroticHub() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/erotic/stories")
      .then((r) => r.json())
      .then((d) => setStories(d.stories || []))
      .finally(() => setLoading(false));
  }, []);

  const recent = stories.slice(0, 5);
  const total = stories.length;
  const developed = stories.filter((s) => s.status === "developed").length;
  const pending = stories.filter((s) => s.status === "sent").length;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-1.5px" }}>
          <Heart className="inline-block w-8 h-8 mr-2 mb-1" style={{ color: "#e879f9" }} />
          Erotic
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Gerenciamento de contos eróticos • Agente Grey
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: total, icon: BookOpen, color: "#e879f9" },
          { label: "Desenvolvidos", value: developed, icon: TrendingUp, color: "#4ade80" },
          { label: "Pendentes", value: pending, icon: TrendingUp, color: "#facc15" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => router.push("/erotic/stories/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "#e879f9", color: "var(--bg)" }}
        >
          <Plus className="w-4 h-4" />
          Novo Conto
        </button>
        <button
          onClick={() => router.push("/erotic/characters")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <Users className="w-4 h-4" />
          Personagens
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Contos Recentes</h2>
          <button
            onClick={() => router.push("/erotic/stories")}
            className="text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            Ver todos →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>Carregando...</div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)" }}>Nenhum conto ainda.</p>
            <button
              onClick={() => router.push("/erotic/stories/new")}
              className="mt-4 px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: "#e879f9", color: "var(--bg)" }}
            >
              Criar primeiro conto
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {recent.map((story) => {
              const badge = statusBadge[story.status] || statusBadge.draft;
              return (
                <div
                  key={story.slug}
                  className="rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  onClick={() => router.push(`/erotic/stories/${story.slug}`)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{story.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${styleColors[story.style] || "#888"}20`, color: styleColors[story.style] || "#888" }}>
                        {story.style}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                      <span>{story.date}</span>
                      <span>{story.word_count} palavras</span>
                    </div>
                  </div>
                  <span style={{ color: "var(--text-muted)" }}>→</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
