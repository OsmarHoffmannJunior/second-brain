# Task Agent — Execução Automatizada de Tasks

## 1. Concept & Vision

@clara é um agente SEO. O Task Agent é um sistema automatizado que faz @clara pegar tasks do Kanban (atribuídas a ela) e executar de forma autônoma — do Backlog ao Review — com notificações detalhadas no Telegram. O Osmar revisa e move manualmente pra Done.

**Tom:** operacional, informativo. Sem fluff — resumos claros com dados concretos.

---

## 2. Architecture

```
*/15 * * * *  (cron a cada 15 min)
      │
      ▼
GET /api/tasks?assigned_to=@clara&status=backlog
      │
      ▼
Task Agent (subagent OpenClaw)
      │
      ├── Move task → in_progress (PUT)
      │
      ├── Executa (descrição + category como instructions)
      │
      ├── Move task → review (PUT)
      │
      └── Notifica @osmar via Telegram
              │
              ▼
        @osmar revisa → move Done manualmente
```

**Quem é o "Task Agent"?**
É um subagent OpenClaw (runtime `subagent`) criado dinamicamente a cada ciclo de cron. Cada task gera um subagent isolado — sem contexto de tasks anteriores.

**Ferramentas disponíveis para o Task Agent:**
- `http` (fetch, POST/GET) — comunica com `/api/tasks`
- `exec` — executa scripts, commands, análise
- `web_fetch` — busca conteúdo de URLs
- `memory_search` — consulta memória da agência
- Demais tools do sistema

**O que NÃO é:**
- Não é um agente persistente (escuta contínua)
- Não acessa diretamente o SQLite (só via API pública)
- Não usa keyboard/mouse automation

---

## 3. Data Flow

### 3.1 Ciclo de Execução (15 min)

```
[CRON TRIGGER]
    ↓
fetch(GET /api/tasks?assigned_to=@clara&status=backlog&sort=due_date:asc)
    ↓
Se tasks.length === 0 → log("Nada a fazer") → finish
    ↓
Para cada task (ordem: due_date ASC):
    ↓
    [TASK AGENT SUBAGENT]
    ├─ PUT /api/tasks { id, status: "in_progress", track_status: "on_track" }
    ├─ Executa task
    ├─ PUT /api/tasks { id, status: "review", track_status: "on_track" }
    └─ Envia Telegram notification (detailed summary)
```

### 3.2 Filtros aplicados

Tasks buscadas com:
- `assigned_to = @clara` (exato)
- `status = backlog`
- Ordenação: `due_date ASC` (mais antigas primeiro)
- Limite: 1 task por ciclo (evita execuções concorrentes no mesmo subagent)

> **Nota:** Se houver muitas tasks, serão processadas uma por ciclo (próxima no próximo ciclo de 15min).

### 3.3 Status Map

| Status | Quem define | Significado |
|--------|------------|-------------|
| `backlog` | UI / Osmar | Aguardando |
| `in_progress` | Task Agent | Executando |
| `review` | Task Agent | Aguardando review do Osmar |
| `done` | Osmar (manual) | Finalizado |

---

## 4. Task Agent — Execution Prompt

Ao criar o subagent, o prompt recebe:

```
## Task a executar

**Título:** [task.title]
**Descrição:** [task.description || "Sem descrição"]
**Categoria:** [task.category] — determina o tipo de trabalho
**Prioridade:** [task.priority]
**Vencimento:** [task.due_date || "não definido"]
**ID:** [task.id]

## Suas instruções

Você é @clara, agente de SEO. Execute a task acima seguindo:
1. Leia a descrição com atenção
2. Execute usando as ferramentas disponíveis (web, search, análise)
3. Documente o resultado da execução (o que fez, descobriu, gerou)
4. Atualize o status da task via API:
   - Quando iniciar: PUT /api/tasks { id, status: "in_progress" }
   - Quando concluir: PUT /api/tasks { id, status: "review" }
5. Envie notificação no Telegram para @osmar com o resumo

## Regras
- Se precisar de mais contexto/input: mova para status "review" com track_status "at_risk" 
  e notifique @osmar pedindo o que precisa. Não invente.
- Se não conseguir completar: mova para "review" com track_status "at_risk" e explique o bloqueio.
- Nunca altere o assigned_to.
- Formato da notificação Telegram: ver seção 6.
```

---

## 5. Category Handlers

O tipo de execução varia conforme `task.category`:

| Category | O que o agente faz |
|----------|-------------------|
| `work` | Análise geral, pesquisa, relatórios |
| `marketing` | SEO, conteúdo, análise de competitors |
| `development` | Code review, análise de logs, scripts |
| `personal` | Pesquisas, tradução, resumo |

O handler é genérico — o prompt inclui a descrição da task como instrução principal. Não há lógica específica por category (YAGNI).

---

## 6. Telegram Notification Format

Enviado via OpenClaw Message API (Telegram) para @osmar.

**Estrutura:**
```
✅ Task concluída

📋 ID: [task.id]
📌 Título: [task.title]
📁 Categoria: [task.category]
⚡ Prioridade: [task.priority]
📅 Vencimento: [task.due_date || "não definido"]
⏱️ Concluída em: [timestamp]

📝 Resumo:
[resultado da execução — 1-3 parágrafos explicando o que foi feito]

🔗 Ver task: http://100.64.39.113:3000/tasks
```

**Exemplo completo:**
```
✅ Task concluída

📋 ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📌 Título: Auditoria SEO — keyword "vestidos de festa"
📁 Categoria: marketing
⚡ Prioridade: urgent
📅 Vencimento: 20/04/2026
⏱️ Concluída em: 14/04/2026 às 17:25 BRT

📝 Resumo:
Análise completa de backlinks do domínioexample.com usando dados de
tráfego do último mês. Identificados 12 novos backlinks de sites
autoridade alta (DA 45+). Proposta de 3 páginas para link building.
Sugestões de anchor texts otimizados para a keyword principal.

🔗 Ver task: http://100.64.39.113:3000/tasks
```

---

## 7. Error / Blocked Handling

### Se @clara precisa de input (bloqueada):
```
⚠️ Task bloqueada — preciso de mais contexto

📋 ID: [task.id]
📌 Título: [task.title]
📁 Motivo: [explicação do que falta]
📝 O que preciso: [input necessário]

🔗 Ver task: http://100.64.39.113:3000/tasks
```

Ação: move para `review` + `track_status: at_risk`

### Se execução falha por erro técnico:
- tenta novamente no próximo ciclo (15 min)
- após 3 falhas consecutivas: notifica "Task travada após 3 tentativas"
- move para `review` + `track_status: off_track`

### Se não há tasks:
- Cron roda silenciosamente — zero notificações

---

## 8. Cron Configuration

```json
{
  "id": "task-agent-executor",
  "name": "Task Agent — Executorde Tasks @clara",
  "schedule": "*/15 * * * *",
  "timezone": "America/Sao_Paulo",
  "enabled": true,
  "action": {
    "type": "script",
    "script_path": "/root/.openclaw/scripts/task-agent-executor.sh"
  },
  "notification": {
    "on_success": "none",
    "on_failure": "telegram"
  }
}
```

---

## 9. File Structure

```
/root/.openclaw/
├── scripts/
│   └── task-agent-executor.sh     ← entrypoint do cron
├── agents/
│   └── task-agent/
│       └── PROMPT.md              ← prompt do subagent por task
└── cron/
    └── jobs.json                  ← atualizado pelo plan
```

---

## 10. Implementation Notes

### API Routes (existentes — não mexer)
- `GET /api/tasks?assigned_to=&status=` ✅
- `PUT /api/tasks` ✅

### Lock/Concurrency
- Apenas 1 subagent por vez (cron executa sequencialmente)
- Se cron dispara enquanto subagent está rodando → skip (cron job single-instance)

### Logging
- Cada execução de task-agent loga em `/root/.openclaw/logs/task-agent.log`
- Formato: `[YYYY-MM-DD HH:mm:ss] Task [id] → [status] | [resultado]`

### Segurança
- Task Agent só pode mover/modificar tasks que tenham `assigned_to = @clara`
- API PUT valida ownership antes de alterar

---

## 11. Out of Scope

- Múltiplos agentes (só @clara por agora)
- Auto-move para Done (Osmar revisa sempre)
- Retry automático de tasks falhadas (limitado a 3 ciclos)
- Histórico de execução por task (v2)
- Notificação antes de iniciar (v2 — opcional)
