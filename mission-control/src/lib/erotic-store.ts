import fs from "fs";
import path from "path";
import matter from "gray-matter";

const STORIES_DIR = "/root/.openclaw/workspace/grey/erotic-stories";
const CHARACTERS_FILE = "/root/.openclaw/workspace/grey/erotic-stories/CHARACTERS.md";

export interface StoryMeta {
  title: string;
  slug: string;
  date: string;
  style: "light" | "sensual" | "heavy" | "hardcore";
  theme: string;
  narrative: "mulher" | "marido" | "terceira-pessoa";
  word_count: number;
  status: "draft" | "sent" | "developed" | "archived";
  characters: string[];
  grey_task_id: string | null;
  created_by: string;
}

export interface Story extends StoryMeta {
  content: string;
}

export interface Character {
  name: string;
  age: string;
  estado_civil: string;
  fisico: string;
  personalidade: string;
  preferencias: string;
  traços: string;
  como_referenciar: string;
}

// ─── Stories ───────────────────────────────────────────────

export function getStories(): StoryMeta[] {
  if (!fs.existsSync(STORIES_DIR)) return [];
  const files = fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(STORIES_DIR, file), "utf-8");
      const { data } = matter(raw);
      return {
        title: data.title || file.replace(".md", ""),
        slug: data.slug || file.replace(".md", ""),
        date: data.date || "",
        style: data.style || "sensual",
        theme: data.theme || "",
        narrative: data.narrative || "terceira-pessoa",
        word_count: data.word_count || 0,
        status: data.status || "draft",
        characters: data.characters || [],
        grey_task_id: data.grey_task_id || null,
        created_by: data.created_by || "Osmar",
      } as StoryMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getStory(slug: string): Story | null {
  const filePath = path.join(STORIES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    title: data.title || slug,
    slug: data.slug || slug,
    date: data.date || "",
    style: data.style || "sensual",
    theme: data.theme || "",
    narrative: data.narrative || "terceira-pessoa",
    word_count: data.word_count || 0,
    status: data.status || "draft",
    characters: data.characters || [],
    grey_task_id: data.grey_task_id || null,
    created_by: data.created_by || "Osmar",
    content,
  };
}

export function createStory(meta: Partial<StoryMeta>): StoryMeta {
  const slug = meta.slug || slugify(meta.title || "untitled");
  const now = new Date().toISOString().split("T")[0];
  const frontmatter = {
    title: meta.title || "Novo Conto",
    slug,
    date: meta.date || now,
    style: meta.style || "sensual",
    theme: meta.theme || "",
    narrative: meta.narrative || "terceira-pessoa",
    word_count: 0,
    status: "draft",
    characters: meta.characters || [],
    grey_task_id: null,
    created_by: meta.created_by || "Osmar",
  };
  const filePath = path.join(STORIES_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, matter.stringify("", frontmatter));
  return frontmatter as StoryMeta;
}

export function updateStoryMeta(slug: string, meta: Partial<StoryMeta>): StoryMeta | null {
  const filePath = path.join(STORIES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const updated = { ...data, ...meta, slug };
  fs.writeFileSync(filePath, matter.stringify(content, updated));
  return updated as StoryMeta;
}

export function updateStoryContent(slug: string, content: string): boolean {
  const filePath = path.join(STORIES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const word_count = content.split(/\s+/).filter(Boolean).length;
  fs.writeFileSync(filePath, matter.stringify(content, { ...data, word_count }));
  return true;
}

export function deleteStory(slug: string): boolean {
  const filePath = path.join(STORIES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function sendToGrey(slug: string): string {
  const inboxDir = "/root/.openclaw/workspace/grey/inbox";
  if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir, { recursive: true });
  const story = getStory(slug);
  if (!story) throw new Error("Story not found");
  const timestamp = Date.now();
  const inboxFile = path.join(inboxDir, `${slug}-${timestamp}.md`);
  const task = `---
task_id: ${timestamp}
action: write-story
source: mission-control
story_slug: ${slug}
title: "${story.title}"
style: ${story.style}
theme: ${story.theme}
narrative: ${story.narrative}
characters: ${story.characters.join(", ")}
---

# Briefing: ${story.title}

Narrativa: ${story.narrative === "mulher" ? "Primeira pessoa feminina" : story.narrative === "marido" ? "Primeira pessoa masculina (marido/corno)" : "Terceira pessoa"}

Tom: ${story.style}

Personagens: ${story.characters.join(", ")}

Tema: ${story.theme}

Use o template STRY-TEMPLATE.md do workspace e o vocabulário de explicit-vocabulary.md.
Salve o resultado em: /root/.openclaw/workspace/grey/erotic-stories/${slug}.md
Use o vocabulário explícito em português brasileiro.
`;
  fs.writeFileSync(inboxFile, task);
  updateStoryMeta(slug, { status: "sent", grey_task_id: String(timestamp) });
  return String(timestamp);
}

// ─── Characters ───────────────────────────────────────────

export function getCharacters(): Character[] {
  if (!fs.existsSync(CHARACTERS_FILE)) return [];
  const raw = fs.readFileSync(CHARACTERS_FILE, "utf-8");
  return parseCharacters(raw);
}

function parseCharacters(content: string): Character[] {
  const characters: Character[] = [];
  const sections = content.split(/^##?\s+\[?[🔴🟡🟢]?\s*(.+)/m).filter(Boolean);
  // Simple parse: each ### Name starts a section
  const blocks = content.split(/^###\s+/m).filter(Boolean);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const name = lines[0]?.trim() || "";
    if (!name) continue;
    const get = (key: string) =>
      lines.find((l) => l.startsWith(key))?.replace(key, "").replace(/^:\s*/, "").trim() || "";
    characters.push({
      name,
      age: get("**Idade:**"),
      estado_civil: get("**Estado civil:**"),
      fisico: get("**Físico:**"),
      personalidade: get("**Personalidade:**"),
      preferencias: get("**Preferências sexuais:**"),
      traços: get("**Traços psicológicos:**"),
      como_referenciar: get("**Como referenciar:**"),
    });
  }
  return characters;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}