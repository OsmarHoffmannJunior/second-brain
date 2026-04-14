import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || "/root/.openclaw";

const ROOT_FILES = ["MEMORY.md", "SOUL.md", "USER.md", "AGENTS.md", "TOOLS.md", "IDENTITY.md"];
const MEMORY_DIR = "memory";

const MEMORY_SUBDIRS = [
  { name: "context", label: "📋 Contexto" },
  { name: "projects", label: "📁 Projetos" },
  { name: "sessions", label: "📅 Sessões" },
  { name: "content", label: "✍️ Conteúdo" },
  { name: "integrations", label: "🔗 Integrações" },
  { name: "feedback", label: "💬 Feedback" },
];

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  label?: string;
  children?: FileNode[];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileTree(workspacePath: string): Promise<FileNode[]> {
  const tree: FileNode[] = [];

  for (const file of ROOT_FILES) {
    const fullPath = path.join(workspacePath, file);
    if (await fileExists(fullPath)) {
      tree.push({ name: file, path: file, type: "file" });
    }
  }

  const memoryPath = path.join(workspacePath, MEMORY_DIR);
  if (await fileExists(memoryPath)) {
    const memoryChildren: FileNode[] = [];

    for (const subdir of MEMORY_SUBDIRS) {
      const subdirPath = path.join(memoryPath, subdir.name);

      if (await fileExists(subdirPath)) {
        const subdirChildren: FileNode[] = [];

        try {
          const entries = await fs.readdir(subdirPath, { withFileTypes: true });

          for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
            if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".json"))) {
              subdirChildren.push({
                name: entry.name,
                path: `${MEMORY_DIR}/${subdir.name}/${entry.name}`,
                type: "file",
              });
            } else if (entry.isDirectory()) {
              const nestedPath = path.join(subdirPath, entry.name);
              const nestedChildren: FileNode[] = [];

              try {
                const nestedEntries = await fs.readdir(nestedPath, { withFileTypes: true });
                for (const nEntry of nestedEntries.sort((a, b) => a.name.localeCompare(b.name))) {
                  if (nEntry.isFile() && (nEntry.name.endsWith(".md") || nEntry.name.endsWith(".json"))) {
                    nestedChildren.push({
                      name: nEntry.name,
                      path: `${MEMORY_DIR}/${subdir.name}/${entry.name}/${nEntry.name}`,
                      type: "file",
                    });
                  }
                }
              } catch {}

              if (nestedChildren.length > 0) {
                subdirChildren.push({
                  name: entry.name,
                  path: `${MEMORY_DIR}/${subdir.name}/${entry.name}`,
                  type: "folder",
                  children: nestedChildren,
                });
              }
            }
          }
        } catch {}

        if (subdirChildren.length > 0) {
          memoryChildren.push({
            name: subdir.name,
            path: `${MEMORY_DIR}/${subdir.name}`,
            type: "folder",
            label: subdir.label,
            children: subdirChildren,
          });
        }
      }
    }

    try {
      const rootEntries = await fs.readdir(memoryPath, { withFileTypes: true });
      for (const entry of rootEntries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (entry.isFile() && entry.name.endsWith(".md")) {
          const isInSubdir = MEMORY_SUBDIRS.some(s => entry.name.startsWith(s.name + "/"));
          if (!isInSubdir) {
            memoryChildren.push({
              name: entry.name,
              path: `${MEMORY_DIR}/${entry.name}`,
              type: "file",
            });
          }
        }
      }
    } catch {}

    if (memoryChildren.length > 0) {
      tree.push({
        name: MEMORY_DIR,
        path: MEMORY_DIR,
        type: "folder",
        label: "🧠 Memória",
        children: memoryChildren,
      });
    }
  }

  return tree;
}

function sanitizePath(requestedPath: string): string | null {
  const normalized = path.normalize(requestedPath);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null;
  if (!normalized.endsWith(".md") && !normalized.endsWith(".json")) return null;

  const isRootFile = ROOT_FILES.includes(normalized);
  const isMemoryFile = normalized.startsWith(`${MEMORY_DIR}/`);
  if (!isRootFile && !isMemoryFile) return null;

  return normalized;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspace = searchParams.get("workspace") || "workspace";
  const filePath = searchParams.get("path");

  try {
    const workspacePath = path.join(OPENCLAW_DIR, workspace);
    if (!(await fileExists(workspacePath))) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (!filePath) {
      const tree = await getFileTree(workspacePath);
      return NextResponse.json(tree);
    }

    const safePath = sanitizePath(filePath);
    if (!safePath) return NextResponse.json({ error: "Invalid file path" }, { status: 400 });

    const fullPath = path.join(workspacePath, safePath);
    if (!(await fileExists(fullPath))) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const content = await fs.readFile(fullPath, "utf-8");
    return NextResponse.json({ path: safePath, content });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace = "workspace", path: filePath, content } = body;

    if (!filePath || typeof content !== "string") {
      return NextResponse.json({ error: "Missing path or content" }, { status: 400 });
    }

    const safePath = sanitizePath(filePath);
    if (!safePath) return NextResponse.json({ error: "Invalid file path" }, { status: 400 });

    const workspacePath = path.join(OPENCLAW_DIR, workspace);
    if (!(await fileExists(workspacePath))) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const fullPath = path.join(workspacePath, safePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");

    return NextResponse.json({ success: true, path: safePath });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
