import { NextRequest, NextResponse } from "next/server";
import { getStory, updateStoryMeta } from "@/lib/erotic-store";
import fs from "fs";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const story = getStory(slug);
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const inboxDir = "/root/.openclaw/workspace/grey/inbox";
    if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir, { recursive: true });

    const timestamp = Date.now();
    const inboxFile = path.join(inboxDir, `${slug}-${timestamp}.md`);

    const narrativeLabel =
      story.narrative === "mulher" ? "Primeira pessoa feminina" :
      story.narrative === "marido" ? "Primeira pessoa masculina (marido/corno)" :
      "Terceira pessoa";

    const extension = (story as unknown as Record<string, unknown>).extension as string | undefined || "média";
    const context = (story as unknown as Record<string, unknown>).context as string | undefined || "A definir pelo escritor.";

    const content = `---
title: "${story.title}"
slug: ${slug}
task_id: ${timestamp}
action: write-story
source: mission-control
---

# Briefing: ${story.title}

## Dados do Conto
- **Tom:** ${story.style}
- **Tema:** ${story.theme}
- **Narrativa:** ${narrativeLabel}
- **Extensão:** ${extension}
- **Personagens:** ${(story.characters || []).join(", ") || "a definir"}

## Synopsis / Context
${context}

## Vocabulário
Use o vocabulário explícito em português brasileiro. Arquivo de referência:
/root/.openclaw/workspace/grey/memory/explicit-vocabulary.md

## Template
Use o template:
/root/.openclaw/workspace/grey/erotic-stories/STORY-TEMPLATE.md

## Saída
Salve o resultado final em:
/root/.openclaw/workspace/grey/erotic-stories/${slug}.md

Após salvar, actualize o frontmatter do arquivo com:
- status: "developed"
- word_count: [número real de palavras]

---

## Início da História

${story.content || "(sem conteúdo prévio)"}
`;

    fs.writeFileSync(inboxFile, content);
    updateStoryMeta(slug, { status: "sent", grey_task_id: String(timestamp) });

    return NextResponse.json({ success: true, taskId: String(timestamp), inboxFile });
  } catch (error) {
    console.error("sendToGrey error:", error);
    return NextResponse.json({ error: "Failed to send to grey" }, { status: 500 });
  }
}
