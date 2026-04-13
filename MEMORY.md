# MEMORY.md — Memória de Longo Prazo

Índice geral. Carregado no início de toda sessão DM. Tudo importante vai aqui.

---

## 🔴 Regras Permanentes (INVIOLÁVEIS)

- **Português apenas** — todas as respostas para Osmar em PT-BR
- **Sem fluff** — nada de "Boa pergunta!", "Ficarei feliz em ajudar!"
- **Compactação SEMPRE extrai primeiro** — regra INVIOLÁVEL: antes de toda compactação, SEM EXCEÇÃO:
  1. Extrair decisões → `memory/context/decisions.md`
  2. Extrair lições → `memory/context/lessons.md`
  3. Extrair pessoas → `memory/context/people.md`
  4. Extrair projetos → `memory/projects/*.md`
  5. Extrair pendências → `memory/pending.md`
  ⚠️ **Se não extrair, a informação se perde permanentemente. É como formatar o HD sem backup.**
- **Feedback loop**: antes de sugerir algo novamente, consultar `memory/feedback/`

---

## 👤 Quem sou eu

- **Nome**: Clara
- **Criatura**: Agente de IA rodando via OpenClaw + MiniMax-M2.7
- **Canal**: Telegram (only)
- **Prefixo comando**: `/`

---

## 👤 Quem é Osmar

- Nome: Osmar (aka @Osmarhjr)
- Local: Itapema/SC, Brasil
- Timezone: BRT (UTC-3)
- Profissão: SEO Strategist + Agency Owner
- Stack: Next.js, Tailwind CSS, Docker, Linux (Ubuntu/Debian), SSH Tunneling, UFW, Fail2Ban
- Automação: Google Sheets, Apps Script, LLM APIs (Gemini, MiniMax)
- Projeto principal: Mission Control (arquitetura modular de agentes via .MD)
- Outras ferramentas: OpenClaw gateway, Typebot, n8n

---

## 📁 Índice de Arquivos

| Arquivo | Conteúdo |
|---------|----------|
| `memory/context/decisions.md` | Decisões permanentes e irreversíveis |
| `memory/context/lessons.md` | Erros que não se repetem |
| `memory/context/people.md` | Equipe, parceiros, contatos |
| `memory/context/business-context.md` | Contexto de negócio recorrente |
| `memory/projects/*.md` | Status de cada projeto ativo |
| `memory/sessions/YYYY-MM-DD.md` | Diário de o que aconteceu |
| `memory/integrations/*.md` | Mapa de ferramentas, IDs, acessos |
| `memory/pending.md` | Aguardando input do Osmar |
| `memory/feedback/*.json` | Aprovações e rejeições de sugestões |
| `memory/content/voice/*.md` | Guias de tom por plataforma |
| `memory/content/ideas.md` | Ideias de conteúdo |
| `DREAMS.md` | Dream Diary (experimental) |

### Estrutura de Pastas

```
memory/
├── MEMORY.md                      ← índice geral
├── context/                       ← não muda rápido
│   ├── decisions.md
│   ├── lessons.md
│   ├── people.md
│   └── business-context.md
├── content/                       ← produção de conteúdo
│   ├── voice/
│   │   ├── linkedin.md
│   │   └── youtube.md
│   ├── ideas.md
│   └── drafts/
├── integrations/                  ← mapa de ferramentas
│   ├── telegram-map.md
│   └── credentials-map.md
├── projects/                      ← um por projeto ativo
│   ├── metricaas.md
│   ├── mgm.md
│   ├── comunidade-ai.md
│   └── mission-control.md
├── sessions/                      ← diário
│   └── 2026-04-13.md
└── feedback/                      ← approve/reject loops
```

---

## 🧠 Como Memória Funciona no OpenClaw

### Session Initialization (otimizado — 2026-04-13)

**Carregado SEMPRE no início de cada sessão:**
- `SOUL.md` — persona e tom
- `USER.md` — perfil do usuário
- `IDENTITY.md` — minha identidade
- `memory/sessions/YYYY-MM-DD.md` — diário de hoje (e ontem se disponível)

**Buscado Sob Demanda via `memory_search()`:**
- `MEMORY.md` (índice geral)
- `memory/context/*.md` (decisions, lessons, people, business-context)
- `memory/projects/*.md`
- `memory/integrations/*.md`
- `memory/feedback/*.json`

**Resultado**: ~8KB por sessão vs ~50KB anterior (~80% economia)

### Ferramentas de Memória

- **`memory_search()`** — busca semântica em todos os arquivos (keyword + vector quando provider disponível)
- **`memory_get()`** — puxa trecho específico de um arquivo (econômico em tokens)

### Importante

⚠️ **Se não extrair antes de compactar, a informação se perde permanentemente.**

---

## 🚨 Revisões Importantíssimas

| Data | Nota |
|------|------|
| 2026-04-13 | Criada arquitetura de memória completa com 8 subdiretórios |

---

_Last updated: 2026-04-13_
