"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

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

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [newChar, setNewChar] = useState({
    name: "", age: "", estado_civil: "", fisico: "",
    personalidade: "", preferencias: "", traços: "", como_referenciar: "",
  });
  const [editChar, setEditChar] = useState<Partial<Character>>({});

  const loadCharacters = () => {
    fetch("/api/erotic/characters")
      .then((r) => r.json())
      .then((d) => setCharacters(d.characters || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCharacters(); }, []);

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
        setShowForm(false);
        setNewChar({ name: "", age: "", estado_civil: "", fisico: "", personalidade: "", preferencias: "", traços: "", como_referenciar: "" });
      }
    } catch (error) {
      console.error("Error creating character:", error);
    }
  };

  const updateCharacter = async (name: string) => {
    try {
      const res = await fetch(`/api/erotic/characters/${encodeURIComponent(name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editChar),
      });
      if (res.ok) {
        const data = await res.json();
        setCharacters((prev) => prev.map((c) => c.name === name ? data.character : c));
        setEditing(null);
        setEditChar({});
      }
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const deleteCharacter = async (name: string) => {
    if (!confirm(`Apagar personagem "${name}"?`)) return;
    try {
      const res = await fetch(`/api/erotic/characters/${encodeURIComponent(name)}`, { method: "DELETE" });
      if (res.ok) {
        setCharacters((prev) => prev.filter((c) => c.name !== name));
      }
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  const startEdit = (char: Character) => {
    setEditing(char.name);
    setEditChar({ ...char });
  };

  const fields: { key: keyof Character; label: string; multiline?: boolean }[] = [
    { key: "age", label: "Idade" },
    { key: "estado_civil", label: "Estado civil" },
    { key: "fisico", label: "Físico", multiline: true },
    { key: "personalidade", label: "Personalidade", multiline: true },
    { key: "preferencias", label: "Preferências sexuais", multiline: true },
    { key: "traços", label: "Traços psicológicos", multiline: true },
    { key: "como_referenciar", label: "Como referenciar", multiline: true },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6" style={{ color: "#e879f9" }} />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
          Personagens
        </h1>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "#e879f9", color: "var(--bg)" }}
        >
          <Plus className="w-4 h-4" />
          Novo Personagem
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Novo Personagem</h3>
          <div className="space-y-3">
            <input value={newChar.name} onChange={(e) => setNewChar({ ...newChar, name: e.target.value })} placeholder="Nome" className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <div className="grid grid-cols-2 gap-3">
              <input value={newChar.age} onChange={(e) => setNewChar({ ...newChar, age: e.target.value })} placeholder="Idade" className="px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input value={newChar.estado_civil} onChange={(e) => setNewChar({ ...newChar, estado_civil: e.target.value })} placeholder="Estado civil" className="px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            {fields.slice(2).map(({ key, label, multiline }) => (
              multiline ? (
                <textarea value={newChar[key]} onChange={(e) => setNewChar({ ...newChar, [key]: e.target.value })} placeholder={label} className="w-full px-3 py-2 rounded-lg outline-none resize-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "60px" }} />
              ) : (
                <input value={newChar[key]} onChange={(e) => setNewChar({ ...newChar, [key]: e.target.value })} placeholder={label} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              )
            ))}
            <div className="flex gap-2">
              <button onClick={createCharacter} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>Criar</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>Carregando...</div>
      ) : characters.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Nenhum personagem ainda.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {characters.map((char) => (
            <div key={char.name} className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="px-5 py-4 flex items-center justify-between cursor-pointer" onClick={() => setEditing(editing === char.name ? null : char.name)}>
                <div>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{char.name}</span>
                  <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>{char.estado_civil} • {char.age}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); deleteCharacter(char.name); }} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: "#ef4444" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {editing === char.name ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                </div>
              </div>
              {editing === char.name && (
                <div className="px-5 pb-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {fields.map(({ key, label, multiline }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
                      {multiline ? (
                        <textarea value={editChar[key] || ""} onChange={(e) => setEditChar({ ...editChar, [key]: e.target.value })} className="w-full px-3 py-2 rounded-lg outline-none resize-none text-sm" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "60px" }} />
                      ) : (
                        <input value={editChar[key] || ""} onChange={(e) => setEditChar({ ...editChar, [key]: e.target.value })} className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={() => updateCharacter(char.name)} className="px-4 py-2 rounded-lg font-medium text-sm" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>Salvar</button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg font-medium text-sm" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
