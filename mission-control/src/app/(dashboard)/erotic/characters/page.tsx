"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Edit3, Trash2 } from "lucide-react";

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
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const res = await fetch("/api/erotic/characters");
      const data = await res.json();
      setCharacters(data.characters || []);
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-1.5px" }}
        >
          <Users className="inline-block w-8 h-8 mr-2 mb-1" style={{ color: "#e879f9" }} />
          Characters
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          {characters.length} personagens • Sincronizado com CHARACTERS.md do Grey
        </p>
      </div>

      {/* Characters list */}
      {characters.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Nenhum personagem encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {characters.map((char) => {
            const isExpanded = expanded === char.name;
            return (
              <div
                key={char.name}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Header - always visible */}
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : char.name)}
                >
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                    >
                      {char.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      {char.age && <span>{char.age}</span>}
                      {char.estado_civil && <span>{char.estado_civil}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {char.preferencias && (
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--surface)", color: "var(--text-muted)" }}>
                        {char.preferencias.split(",")[0]}
                      </span>
                    )}
                    <button
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : char.name); }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5 space-y-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    {char.fisico && (
                      <div>
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Físico</span>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{char.fisico}</p>
                      </div>
                    )}
                    {char.personalidade && (
                      <div>
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Personalidade</span>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{char.personalidade}</p>
                      </div>
                    )}
                    {char.preferencias && (
                      <div>
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Preferências sexuais</span>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{char.preferencias}</p>
                      </div>
                    )}
                    {char.traços && (
                      <div>
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Traços psicológicos</span>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{char.traços}</p>
                      </div>
                    )}
                    {char.como_referenciar && (
                      <div>
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Como referenciar</span>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{char.como_referenciar}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}