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

    const styleMapping: Record<string, string> = {
      light: "sutil/poético (eufemismos, metáforas, tom lírico)",
      sensual: "sensual/realista (descrições directas, sensações físicas)",
      heavy: "literário/artístico (pros rico, ritmo trabalhado, profundidade)",
      hardcore: "sensual/realista intenso (descrições directas sem gore)",
    };
    const mappedStyle = styleMapping[story.style] || "sensual/realista";

    const extensionLabel =
      extension.includes("800") ? "~1.000 palavras (Curto)" :
      extension.includes("2000") ? "~2.000 palavras (Médio)" :
      extension.includes("3000") ? "~3.000 palavras (Longo)" :
      "~1.500 palavras (Médio)";

    const content = `---
title: "${story.title}"
slug: ${slug}
task_id: ${timestamp}
action: write-story
source: mission-control
---

# Conto Erótico: ${story.title}

## SKILL INVOKE: erotic-writer

Use a skill **erotic-writer** para escrever este conto.

## Parâmetros do Conto
- **Estilo de escrita:** ${mappedStyle}
- **Tema:** ${story.theme}
- **Narrativa:** ${narrativeLabel}
- **Extensão:** ${extensionLabel}
- **Personagens:** ${(story.characters || []).join(", ") || "a definir"}

## Context / Synopsis
${context}

## Personagens Disponíveis
Ler o perfil dos personagens em:
/root/.openclaw/workspace/grey/erotic-stories/CHARACTERS.md

## Vocabulário Explícito (OBRIGATÓRIO)
Ler e interiorizar o ficheiro:
/root/.openclaw/workspace/grey/memory/explicit-vocabulary.md

Este ficheiro contém termos explícitos recolhidos de contos reais em português brasileiro. USA estes termos自然なmente na narrativa para dar autenticidade:
- Partes do corpo: rola, pau, cacete, caralho, cuzinho, xota, alcinhas, seios, clitóris, ânus, buraquinho, bunda, rabão, quadril
- Acções: foder, meter, comer, gozar, goza gostoso, lamber, sugar, enfiar, meter, ensopada, lambuzar, rebolar, rebolando, revesar, punhetar, boquete, currada, enfiada
- Descrições: avantajada, bombando, cachoeira, babado, putaria, safadinha, putinha, madrinha, patricinha, diarista
- Fluidos: sêmen, esperma, jatos quentes, leite, leitinho
- Pussy talk: fodendo, fodida, putaria, delícias, guerreira

Integra estes termos de forma orgânica na narrativa — não enumerar, usar como 자연스러운 descrições.

## Regras de Escrita (skill erotic-writer)
1. **Tensão gradual** — construa atmosfera antes de chegar na cena
2. **Detalhe sensorial** — tato, olfato, visão, som, paladar
3. **Sugestão artística** — menos é mais. Descreva sem ser explícito
4. **Profundidade emocional** — o corpo é contexto, a emoção é o ponto
5. **Ritmo e pacing** — frases curtas para tensão, parágrafos longos para entrega
6. **Português BR** — todo conteúdo em português brasileiro
7. **Sem gore/violência sexual** — foco em conexão e consentimento

## Output
Salvar em: /root/.openclaw/workspace/grey/erotic-stories/${slug}.md

Formato frontmatter:
\`\`\`yaml
---
title: "${story.title}"
date: ${new Date().toISOString().split("T")[0]}
style: ${story.style}
theme: "${story.theme}"
narrative: ${story.narrative}
word_count: <N>
status: developed
characters:
${(story.characters || []).map((c: string) => `  - ${c}`).join("\n")}
---
\`\`\`

## Início da História (se houver conteúdo prévio)
${story.content || "(escrever do zero)"}
`;

    fs.writeFileSync(inboxFile, content);
    updateStoryMeta(slug, { status: "sent", grey_task_id: String(timestamp) });

    return NextResponse.json({ success: true, taskId: String(timestamp), inboxFile });
  } catch (error) {
    console.error("sendToGrey error:", error);
    return NextResponse.json({ error: "Failed to send to grey" }, { status: 500 });
  }
}
