# Obsidian Vault — Template para Osmar

## Como usar este template

Este arquivo serve como **guia de estruturação** para seu novo vault Obsidian.
O vault real deve ser criado no Obsidian seguindo a estrutura abaixo.

Para sincronizar com o servidor sem perder arquivos existentes:
- Vault fica local no seu Mac/PC
- Arquivos no servidor via Obsidian Git (ou iCloud)
- O servidor clona o repo e a Clara acessa localmente

---

## Estrutura de Pastas

```
Obsidian Vault/
├── 📁 00-meta/              # Configurações e identidade do vault
│   ├── 📄 Identidade.md      # Quem é você (NAME, timezone, preferências)
│   ├── 📄 Projetos/          # Índice de todos os projetos
│   └── 📄 Tags-índice.md     # Como organizar tags
│
├── 📁 01-diário/            # Notas diárias (uma por dia)
│   ├── 📄 YYYY-MM-DD.md      # Ex: 2026-04-14.md
│   └── 📄 .template.md       # Template para nova diária
│
├── 📁 02-projetos/          # Cada projeto = uma nota
│   ├── 📄 projeto-nome.md   # Template: 09-templates/Projeto.md
│   └── 📄 .índice.md         # Lista de projetos ativos
│
├── 📁 03-contexto/          # Decisões, lições, pessoas (evergreen)
│   ├── 📄 Decisões.md        # Regras permanentes e irreversíveis
│   ├── 📄 Lições.md          # Erros que não se repetem
│   ├── 📄 Pessoas.md          # Contatos e contexto
│   └── 📄 Contexto-negocio.md # Regras do negócio
│
├── 📁 04-integrations/       # Mapa de ferramentas e credenciais
│   ├── 📄 Mapa-ferramentas.md
│   └── 📄 Credenciais.md      # Senhas → NUNCA commitadas no Git
│
├── 📁 05-content/           # Conteúdo criado (por plataforma)
│   ├── 📄 LinkedIn/
│   ├── 📄 YouTube/
│   └── 📄 Blog/
│
├── 📁 06-feedback/          # Aprovações e rejeições
│   ├── 📄 Aprovações.json
│   └── 📄 Rejeições.json
│
├── 📁 07-backlog/           # Tasks e ideias pendentes
│   ├── 📄 Ideias.md
│   └── 📄 Pendencias.md
│
├── 📁 08-sessoes/           # Resumos de sessões com a Clara
│   └── 📄 YYYY-MM-DD.md
│
├── 📁 09-templates/         # Templates para não repetir trabalho
│   ├── 📄 Projeto.md
│   ├── 📄 Diária.md
│   ├── 📄 Task.md
│   └── 📄 Sessão.md
│
└── 📄 .obsidian/            # Configurações do app (não mexer)
```

---

## Arquivos Principais

### 00-meta/Identidade.md

```markdown
# Identidade — Osmar

**Nome:** Osmar (aka @Osmarhjr)
**Local:** Itapema, SC — BRT (UTC-3)
**Profissão:** Analista SEO / Dono de agência
**Stack:** Next.js, Tailwind CSS, Docker, Linux, OpenClaw, Typebot, n8n

## Preferências
- **Canal principal:** Telegram (único)
- **Idioma:** Português brasileiro
- **Tom:** direto, sem fluff
- **Orçamento mental:** R$ 0 para ferramentas externas

## Contato
- Telegram: @Osmarhjr
```

### 02-projetos/.índice.md

```markdown
# Projetos Ativos

| Projeto | Status | Última Atualização | Responsável |
|---------|--------|--------------------|-------------|
| Mission Control | 🟢 active | 2026-04-14 | Clara |
| Task Agent | 🟢 active | 2026-04-14 | Clara |
| - | - | - | - |

## Arquivados
- _(vazio)_
```

### 03-contexto/Decisões.md

```markdown
# Decisões Permanentes

**Regra:** Decisão aqui = não volta atrás. Se mudar, mover para Lições como "reversão".

## Regras de Comunicação
| Decisão | Data | Motivo |
|---------|------|--------|
| Português apenas | YYYY-MM-DD | — |
| Sem fluff | YYYY-MM-DD | — |

## Arquitetura
| Decisão | Data | Motivo |
|---------|------|--------|
| Agent: Clara | YYYY-MM-DD | — |
| Canal: Telegram | YYYY-MM-DD | — |
```

### 09-templates/Projeto.md

```markdown
# NOME-DO-PROJETO

## metadata
| Campo | Valor |
|-------|-------|
| Status | active/paused/done |
| Início | YYYY-MM-DD |
| Atualização | YYYY-MM-DD |

## Objetivo
_O que este projeto quer alcançar._

## Stack
- item

## Marcos
| Marco | Status | Data | Notas |
|-------|--------|------|-------|
| - | - | - | - |

## Tarefas
| Tarefa | Prioridade | Responsável | Deadline |
|--------|------------|-------------|----------|
| - | - | - | - |

## Histórico
| Data | Evento |
|------|--------|
| YYYY-MM-DD | Criado |
```

---

## Como Sincronizar (sem perder arquivos)

### Opção 1: Obsidian Git (recomendado)

1. **No seu Mac/PC:**
   - Instalar plugin "Obsidian Git" no Obsidian
   - Criar repo GitHub privado
   - Configurar o plugin:
     - Auto-commit: a cada 5 min
     - Auto-pull: ao abrir o vault

2. **No servidor:**
   ```bash
   # Clonar o repo
   git clone https://github.com/SEU_USER/obsidian-vault.git /root/obsidian-vault
   
   # A Clara acessa localmente
   # path: /root/obsidian-vault/
   ```

3. **Branches:**
   - `main` = produção (o que a Clara usa)
   - Nunca commitar credenciais (`.gitignore` inclui `03-contexto/Credenciais.md`)

### Opção 2: iCloud + script no servidor

1. Vault no iCloud Drive
2. Servidor acessa via `icloudpd` ou similar
3. Menos confiável que Git

---

## Regras de Segurança

1. **Credenciais** ficam SOMENTE em `04-integrations/Credenciais.md` (que está no `.gitignore`)
2. **Arquivos do servidor** (scripts, configs) nunca vão para o vault
3. **Obsidian Publish** = público por padrão — não usar para nada sensível

---

## Como a Clara vai usar

```
/root/obsidian-vault/
├── 01-diário/        → consulta para contexto de sessões passadas
├── 03-contexto/      → decisões, lições, pessoas (sempre fresco)
├── 02-projetos/      → status de projetos ativos
└── 07-backlog/       → ideias e pendências
```

A Clara vai:
- Ler `03-contexto/Decisões.md` antes de qualquer ação
- Escrever resumos em `08-sessoes/YYYY-MM-DD.md`
- Criar/atualizar notas em `02-projetos/` quando necessário

---

## Primeiros Passos ( checklist )

- [ ] Criar repo GitHub privado
- [ ] Criar vault local no Obsidian com esta estrutura
- [ ] Configurar Obsidian Git plugin
- [ ] Commit inicial
- [ ] Clonar no servidor (`/root/obsidian-vault/`)
- [ ] Testar acesso da Clara ao vault
- [ ] Migrar arquivos existentes (se houver)
- [ ] Commit da migração
