# /erotic Area — Implementation Spec

> **Goal:** Gerenciamento completo de contos eróticos usando o agente Grey
> **Architecture:** Interface unificada — Hub + Stories + Editor + Characters
> **Tech Stack:** Next.js + Tailwind (mantém padrão MC), TypeScript, grey-matter

---

## 1. Estrutura de Navegação

```
/erotic                          → Hub (story cards + ações rápidas)
/erotic/stories                 → Lista completa de contos
/erotic/stories/new             → Criar novo conto (form de briefing)
/erotic/stories/[slug]          → Editor completo
/erotic/characters              → CRUD de personagens
```

**Dock:** "Erotic" com ícone ♥ entre Memory e Agents.

---

## 2. Estrutura de Dados

### Conto (grey/erotic-stories/<slug>.md)
```yaml
---
title: "Surpresa no Aniversário"
slug: surpresa-no-aniversario
date: 2026-04-23
style: heavy
context: "Carlos planeja presente de aniversário..."
theme: hotwife, anal, corno manso
narrative: marido
characters: [Marina, Carlos, Rafael]
extension: ~1200 palavras
status: draft
word_count: 0
grey_task_id: null
---
[conteúdo narrativo]
```

**Campos:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| title | string | Título do conto |
| slug | string | Slug URL-friendly |
| date | string | Data de criação (YYYY-MM-DD) |
| style | enum | light \| sensual \| heavy \| hardcore |
| context | string | Synopsis/direcionamento para o Grey |
| theme | string | Tags separadas por vírgula |
| narrative | enum | mulher \| marido \| terceira-pessoa |
| characters | string[] | Nomes dos personagens |
| extension | string | ~1200 palavras (curto/médio/longo) |
| status | enum | draft \| sent \| developed |
| word_count | number | Contagem de palavras |
| grey_task_id | string \| null | ID da task no Grey |

### Personagem (grey/erotic-stories/CHARACTERS.md)
Formato existente — mantém compatibilidade:
```markdown
### [Nome]
- **Idade:** X anos
- **Estado civil:** solteira/casada/divorciada
- **Físico:** [descrição]
- **Personalidade:** [traços]
- **Preferências sexuais:** [o que gosta na cama]
- **Traços psicológicos:** [medos, desejos ocultos]
- **Como referenciar:** [apelidos]
```

---

## 3. Fluxo de Estados

```
draft → sent → developed
```

| Status | Badge | Descrição |
|--------|-------|-----------|
| draft | Rascunho | Briefing criado, não enviado |
| sent | 📤 Enviado | Enviado ao Grey, aguardando |
| developed | ✅ Desenvolvido | Texto pronto |
| timeout | ⚠️ Timeout | Grey não respondeu (>5min) |

---

## 4. Store (erotic-store.ts)

Funções existentes a manter:
- `getStories()` / `getStory(slug)`
- `createStory(meta)`
- `updateStory(slug, meta)` / `updateContent(slug, content)`
- `deleteStory(slug)`
- `sendToGrey(slug)` → `grey/inbox/<slug>-<timestamp>.md`

Funções novas:
- `sendToGrey(slug)` → retorna taskId + atualiza status=sent
- `pollStoryStatus(slug)` → checa se status mudou para developed
- `getCharacters()` → parse CHARACTERS.md
- `createCharacter(char)` → append ao CHARACTERS.md
- `updateCharacter(name, char)` → atualiza seção do personagem
- `deleteCharacter(name)` → remove seção do personagem

---

## 5. API Routes

| Método | Endpoint | Função |
|--------|----------|--------|
| GET | `/api/erotic/stories` | Lista todos os contos |
| POST | `/api/erotic/stories` | Cria novo conto |
| GET | `/api/erotic/stories/[slug]` | Get conto completo |
| PUT | `/api/erotic/stories/[slug]` | Update meta |
| DELETE | `/api/erotic/stories/[slug]` | Remove conto |
| GET | `/api/erotic/stories/[slug]/content` | Get conteúdo narrativo |
| PUT | `/api/erotic/stories/[slug]/content` | Update conteúdo |
| POST | `/api/erotic/stories/[slug]/send-to-grey` | Envia briefing ao Grey |
| GET | `/api/erotic/characters` | Lista personagens |
| POST | `/api/erotic/characters` | Cria personagem |
| PUT | `/api/erotic/characters/[name]` | Atualiza personagem |
| DELETE | `/api/erotic/characters/[name]` | Remove personagem |

---

## 6. Componentes de Interface

### /erotic (Hub)
- Story cards recentes (3-5) com status badge, tom badge, data
- Ações rápidas: "+ Novo Conto" + "Personagens"
- Overview: total de contos, desenvolvidos, pendentes

### /erotic/stories (Lista)
- Cards/tabela: título, tom badge, status badge, personagens (chips), data, word_count
- Filtros: por status, por tom
- Botão "Novo Conto"

### /erotic/stories/new + /erotic/stories/[slug] (Editor Unificado)
- Sidebar/meta: título, tom, tema, narrativa, extensão, context, personagens (multi-select + criar inline)
- Área de conteúdo: textarea editável (markdown)
- Footer ações: Salvar | "Desenvolver com Grey"
- Polling automático após envio ao Grey

### /erotic/characters (CRUD)
- Lista de personagens com preview inline
- Expander para ver detalhes completos
- Form de criar/editar (idade, estado civil, físico, personalidade, preferências, como referenciar)
- Criar inline no editor de conto (modal)

---

## 7. Integração com Grey

**Envio:**
1. POST `/api/erotic/stories/[slug]/send-to-grey`
2. Store cria `grey/inbox/<slug>-<timestamp>.md`
3. Status → `sent`
4. Inbox file inclui todo o briefing YAML

**Polling:**
- Página do editor faz polling a cada 10s após envio
- GET `/api/erotic/stories/[slug]`
- Se status = `developed` → badge verde
- Timeout > 5min → badge vermelho com "Reenviar"

**Reenvio:**
- Botão "Reenviar ao Grey" disponível em `sent` e `developed`
- Regenera inbox file com mesmo briefing

---

## 8. Criar Personagem Inline no Editor

1. Campo personagens: multi-select com input livre
2. Se digita nome inexistente → botão "+ Criar [nome]"
3. Abre modal com form completo
4. Ao salvar → CHARACTERS.md atualizado + personagem selecionado

---

## 9. Dependências

- `gray-matter` — já instalado (para frontmatter)
- Nenhuma lib nova necessária

---

_Last updated: 2026-04-23_
