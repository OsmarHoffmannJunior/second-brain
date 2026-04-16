# Notion Tarefas — Design

**Data:** 2026-04-16
**Autor:** Clara
**Status:** Aprovado

---

## Objetivo

Usar o Notion como sistema de tarefas para clientes da Hoff Consultoria. Cron Clara envia resumo diário 07h BRT via Telegram com tarefas vencidas, vencendo, urgentes e próximas.

---

## Estrutura

### Database: Tarefas

Local: dentro da página "Hoff Consultoria" (ID: 21fbb022-b17e-8091-a9e8-d21607d230e8)

```
Hoff Consultoria (página)
  └── Tarefas (database)
```

### Colunas

| Coluna | Tipo | Opções |
|--------|------|--------|
| Tarefa | title | — |
| Cliente | select | Espaço Recomeçar, Nova Concursos, AmoPorno, Tend Skin-Odaban, Armarinho São José |
| Status | select | backlog, em andamento, em produção, aguardando aprovação, em revisão, pronto para aplicar, done |
| Urgência | select | urgente, alta, normal, baixa |
| Data de término | date | — |

---

## Clientes

- Espaço Recomeçar
- Nova Concursos
- AmoPorno
- Tend Skin-Odaban
- Armarinho São José

---

## Cron — Resumo 07h BRT

**Expressão:** `0 10 * * *` (07h BRT = 10h UTC)
**Ação:** Composio → `NOTION_QUERY_DATABASE` → filtra tasks Status ≠ done
**Formato Telegram:**

```
📋 Resumo Notion — DD/MM/YYYY

🔴 Vencidas (N)
• Tarefa — Cliente — Venceu DD/MM

🟡 Vencendo hoje (N)
• Tarefa — Cliente — Hoje

🟠 Urgentes (N)
• Tarefa — Cliente — Urgente

🟢 Próximas (3 dias) (N)
• Tarefa — Cliente — DD/MM
```

---

## Criação de Tasks

| Quem | Como |
|------|------|
| Osmar | Cria direto no Notion |
| Clara | Composio `NOTION_INSERT_ROW_DATABASE` |

---

## Divisão de Responsabilidade

| Ferramenta | Uso |
|------------|-----|
| Notion | Source of truth — tarefas de clientes |
| Mission Control /tasks | Tarefas internas Clara+Osmar |
| Composio + Notion API | Leitura/criação via Composio CLI |
| Cron 07h BRT | Clara envia resumo pro Telegram |

---

## Implementação

1. Osmar cria database "Tarefas" dentro da página Hoff Consultoria
2. Clara adiciona cron job `0 10 * * *`
3. Script `notion-daily-summary.sh` usa Composio + Notion API
4. Clara envia resumo pro Telegram

---

_Last updated: 2026-04-16_