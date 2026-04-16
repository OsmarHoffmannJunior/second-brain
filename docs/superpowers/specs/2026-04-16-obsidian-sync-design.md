# Obsidian Sync — Mission Control → Obsidian Vault

**Data:** 2026-04-16
**Autor:** Clara
**Status:** Aprovado

---

## Objetivo

Sincronizar conteúdo do Mission Control para o Obsidian Vault a cada 15 minutos, mantendo um second brain pessoal atualizado automaticamente. O Obsidian funciona como "memória externa" — conectado ao Mission Control mas com liberdade para anotações manuais.

---

## Arquitetura

```
Mission Control (DB SQLite + arquivos .md)
        ↓ a cada 15 min (cron)
obsidian-sync.sh (bash script)
        ↓ exporta para
Obsidian Vault (/root/obsidian-vault/)
        ↓ acessível via
SMB share (\\100.64.39.113\ObsidianVault)
```

---

## O que é exportado

### 1. Memory (sempre)
Pasta `memory/` do workspace — decisões, lições, contexto, projetos, people.

| Arquivo | Destino no Obsidian |
|---------|-------------------|
| `memory/context/decisions.md` | `05-memory/decisions.md` |
| `memory/context/lessons.md` | `05-memory/lessons.md` |
| `memory/context/people.md` | `05-memory/people.md` |
| `memory/context/business-context.md` | `05-memory/business-context.md` |
| `memory/projects/*.md` | `05-memory/projects/` |
| `memory/sessions/YYYY-MM-DD.md` | `05-memory/sessions/YYYY-MM-DD.md` |

### 2. Tasks (só done + review)
Pasta `06-tasks/` no Obsidian — histórico de tasks executadas, agrupadas por dia.

| Status | Destino |
|--------|---------|
| `done` | `06-tasks/done/YYYY-MM-DD.md` |
| `review` | `06-tasks/review/YYYY-MM-DD.md` |

Tasks em `backlog` NÃO são exportadas — são operacionais.

---

## Estrutura de Pastas no Obsidian

```
05-memory/
  decisions.md
  lessons.md
  people.md
  business-context.md
  projects/
    santtas.md
    mission-control.md
    metricaas.md
    mgm.md
    comunidade-ai.md
    ...
  sessions/
    2026-04-15.md
    2026-04-14.md
    ...
06-tasks/
  done/
    2026-04-15.md
    2026-04-14.md
    ...
  review/
    2026-04-15.md
    ...
```

**Nota:** Pasta começa em `05` para não conflitar com estrutura existente (00-04 já existem).

---

## Formato das Notas Exportadas

### Task (done/review)
```markdown
---
id: task_003
title: "Verifique novas publicações"
status: done
assigned_to: "@clara"
due_date: 2026-04-14
completed_at: 2026-04-14T14:23:00Z
priority: normal
category: seo
project: santtas
---

## Descrição
Pesquisa de publicações no blog de SEO sobre tendências.

## Notas
Usou Composio + GSC para levantar dados.
```

### Memory files
Copiados diretamente, mantêm formato original.

---

## Comportamento do Sync

| Aspecto | Comportamento |
|---------|--------------|
| Primeira execução | Exporta tudo, cria estrutura |
| Execuções seguintes | Incremental — só o que mudou desde último sync |
| Conflito (MC + Obsidian mudaram) | MC sobrescreve — observação registrada |
| Nada mudou | Silêncio — sem notificação |
| Erro | Log em `/root/.openclaw/logs/obsidian-sync.log` |

---

## Formato do Arquivo de Estado

`/root/.openclaw/state/obsidian-sync-state.json`

```json
{
  "last_sync": "2026-04-16T00:45:00Z",
  "last_task_sync": "2026-04-16T00:45:00Z",
  "last_memory_sync": "2026-04-16T00:45:00Z",
  "memory_files": {
    "decisions.md": "2026-04-15T22:00:00Z",
    "lessons.md": "2026-04-14T18:00:00Z"
  },
  "task_last_export": "2026-04-15T23:59:00Z"
}
```

---

## Cron Job

```
*/15 * * * * /root/.openclaw/scripts/obsidian-sync.sh >> /root/.openclaw/logs/obsidian-sync.log 2>&1
```

---

## Scripts

1. `obsidian-sync.sh` — entry point, orchestrator
2. `sync-memory.sh` — exporta memory/ (etapa 1)
3. `sync-tasks.sh` — exporta tasks done/review (etapa 2)

---

## Dependências

- `bash`, `python3`, `jq`
- Acesso SMB ao Obsidian (já configurado)
- Cron job via OpenClaw

---

## NÃO é escopo

- Export de cron jobs, sessions, activities, agents
- Sincronização bidirecional (MC não lê do Obsidian)
- Webhook/event-based — apenas cron

---

## Métricas de Sucesso

- Obsidian abre e mostra notas atualizadas
- Tasks done/review aparecem agrupadas por data
- Memory files mantêm formato legível
- Sync roda sem erro por 24h
- Sem duplicação de conteúdo
