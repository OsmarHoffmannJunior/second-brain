"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

export default function NewStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [showCharForm, setShowCharForm] = useState(false);
  const [newChar, setNewChar] = useState({ name: "", age: "", estado_civil: "", fisico: "", personalidade: "", preferencias: "", traços: "", como_referenciar: "" });
  const [form, setForm] = useState({
    title: "",
    style: "sensual",
    context: "",
    theme: "",
    narrative: "terceira-pessoa",
    extension: "~1200 palavras",
  });

  useEffect(() => {
    fetch("/api/erotic/characters")
      .then((r) => r.json())
      .then((d) => setCharacters(d.characters || []));
  }, []);

  const toggleChar = (name: string) => {
    setSelectedChars((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
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
        setSelectedChars((prev) => [...prev, newChar.name]);
        setShowCharForm(false);
        setNewChar({ name: "", age: "", estado_civil: "", fisico: "", personalidade: "", preferencias: "", traços: "", como_referenciar: "" });
      }
    } catch (error) {
      console.error("Error creating character:", error);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/erotic/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, characters: selectedChars }),
      });
      const data = await res.json();
      if (data.story) {
        router.push(`/erotic/stories/${data.story.slug}`);
      }
    } catch (error) {
      console.error("Error creating story:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
          Novo Conto
        </h1>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            placeholder="Título do conto..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tom</label>
            <select
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
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
              value={form.narrative}
              onChange={(e) => setForm({ ...form, narrative: e.target.value })}
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
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tema (vírgulas)</label>
          <input
            type="text"
            value={form.theme}
            onChange={(e) => setForm({ ...form, theme: e.target.value })}
            className="w-full px-3 py-2 rounded-lg outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            placeholder="hotwife, anal, corno manso..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Extensão</label>
          <select
            value={form.extension}
            onChange={(e) => setForm({ ...form, extension: e.target.value })}
            className="w-full px-3 py-2 rounded-lg outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <option>~800 palavras</option>
            <option>~1200 palavras</option>
            <option>~2000 palavras</option>
            <option>~3000 palavras</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Context / Synopsis</label>
          <textarea
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            className="w-full px-3 py-2 rounded-lg outline-none resize-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "100px" }}
            placeholder="Resumo do conto para direcionar o Grey..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Personagens ({selectedChars.length} selecionados)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {characters.map((char) => (
              <button
                key={char.name}
                onClick={() => toggleChar(char.name)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: selectedChars.includes(char.name) ? "var(--accent)" : "var(--surface)",
                  color: selectedChars.includes(char.name) ? "var(--bg)" : "var(--text-secondary)",
                  border: `1px solid ${selectedChars.includes(char.name) ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {char.name}
              </button>
            ))}
          </div>
          {showCharForm ? (
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-2 gap-3">
                <input value={newChar.name} onChange={(e) => setNewChar({ ...newChar, name: e.target.value })} placeholder="Nome" className="px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input value={newChar.age} onChange={(e) => setNewChar({ ...newChar, age: e.target.value })} placeholder="Idade" className="px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <input value={newChar.estado_civil} onChange={(e) => setNewChar({ ...newChar, estado_civil: e.target.value })} placeholder="Estado civil" className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <textarea value={newChar.fisico} onChange={(e) => setNewChar({ ...newChar, fisico: e.target.value })} placeholder="Físico" className="w-full px-3 py-2 rounded-lg outline-none resize-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "60px" }} />
              <textarea value={newChar.preferencias} onChange={(e) => setNewChar({ ...newChar, preferencias: e.target.value })} placeholder="Preferências sexuais" className="w-full px-3 py-2 rounded-lg outline-none resize-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "60px" }} />
              <div className="flex gap-2">
                <button onClick={createCharacter} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>Criar</button>
                <button onClick={() => setShowCharForm(false)} className="px-4 py-2 rounded-lg font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCharForm(true)}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}
            >
              + Criar novo personagem
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !form.title.trim()}
            className="px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "#e879f9", color: "var(--bg)" }}
          >
            {loading ? "Criando..." : "Criar Conto"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
