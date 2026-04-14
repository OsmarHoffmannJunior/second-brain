# content/skills-catalog.md — Skills por Perfil (ClawHub)

**Fonte**: ClawHub skill guide
**Última atualização**: 2026-04-14

---

## Perfil: Empreendedor / Founder (Osmar)

### Skills recomendadas pro Osmar

| Skill | Status | Instalação | Prioridade |
|-------|--------|------------|------------|
| `gog` (Google Workspace) | built-in | `openclaw skill enable gog` | 🔴 Alta |
| `stripe-api` | clawhub | `openclaw skill install clawhub/stripe` | 🔴 Alta |
| `analytics-reports` | clawhub | `openclaw skill install clawhub/analytics` | 🔴 Alta |
| `postgres-query` | clawhub | `openclaw skill install clawhub/postgres` | 🟡 Média |
| `notion-db` | clawhub | `openclaw skill install clawhub/notion` | 🟡 Média |
| `slack-admin` | clawhub | `openclaw skill install clawhub/slack` | 🟡 Média |
| `financial-dashboard` | clawhub | `openclaw skill install clawhub/finance` | 🟡 Média |

---

## Perfil: Criador de Conteúdo (Osmar)

| Skill | Status | Instalação | Prioridade |
|-------|--------|------------|------------|
| `openai-image-gen` | built-in | `openclaw skill enable openai-image-gen` | 🔴 Alta |
| `openai-whisper-api` | built-in | `openclaw skill enable openai-whisper-api` | 🟡 Média |
| `youtube-metadata` | clawhub | `openclaw skill install clawhub/youtube` | 🔴 Alta |
| `twitter-scheduler` | clawhub | `openclaw skill install clawhub/twitter` | 🟡 Média |

---

## Profile: Desenvolvedor

| Skill | Status | Instalação | Prioridade |
|-------|--------|------------|------------|
| `tmux` | built-in | `openclaw skill enable tmux` | ✅ Já tem (skill-creator) |
| `github` | built-in | `openclaw skill enable github` | ✅ |
| `docker-compose` | clawhub | `openclaw skill install clawhub/docker` | - |

---

## Avisos de Segurança

⚠️ **Antes de instalar skill:**
1. Ler SKILL.md
2. Revisar scripts (procurar `rm -rf`, `eval`, `curl` suspeito)
3. Verificar se não duplica funcionalidade existente
4. Testar em ambiente isolado

⚠️ **Após instalar:**
1. Credenciais no `.env` ou 1Password
2. Testar cada tool
3. Documentar em `TOOLS.md`
4. Atualizar `AGENTS.md` se precisar regras especiais

---

## Anatomia de uma Skill

```
skill-name/
├── SKILL.md       ← documentação + declaração de tools
├── tool-one.sh    ← script executável
└── tool-two.sh    ← outro script
```

---

## Como descobrir mais

- https://clawhub.com
- GitHub topic: `openclaw-skill`
- Discord: #skills

---

_Last updated: 2026-04-14_