"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart, BookOpen, Users } from "lucide-react";

const tabs = [
  { id: "stories", label: "Stories", href: "/erotic/stories", icon: BookOpen },
  { id: "characters", label: "Characters", href: "/erotic/characters", icon: Users },
];

export default function EroticPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTab =
    pathname === "/erotic" || pathname === "/erotic/"
      ? "stories"
      : tabs.find((t) => pathname.startsWith(t.href))?.id || "stories";

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
            letterSpacing: "-1.5px",
          }}
        >
          <Heart className="inline-block w-8 h-8 mr-2 mb-1" style={{ color: "#e879f9" }} />
          Erotic
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Gerenciamento de contos eróticos • Agente Grey
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => router.push(`/erotic/${id === "stories" ? "stories" : "characters"}`)}
              className="flex items-center gap-2 px-4 py-2 font-medium transition-all"
              style={{
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                borderBottomStyle: "solid",
                borderBottomWidth: "2px",
                borderBottomColor: isActive ? "var(--accent)" : "transparent",
                paddingBottom: "0.5rem",
                background: "none",
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {currentTab === "stories" ? (
        <div className="space-y-4">
          <div
            className="rounded-xl p-8 text-center"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Contos
            </h2>
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              Lista de contos eróticos criados e desenvolvidos com o agente Grey.
            </p>
            <button
              onClick={() => router.push("/erotic/stories")}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              Ver Contos
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="rounded-xl p-8 text-center"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Personagens
            </h2>
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              Base de personagens para contos eróticos. Sincronizado com CHARACTERS.md do Grey.
            </p>
            <button
              onClick={() => router.push("/erotic/characters")}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              Ver Personagens
            </button>
          </div>
        </div>
      )}
    </div>
  );
}