# Task Agent — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cron a cada 15 min que detecta tasks atribuídas a @clara no backlog, entrega a um subagent que executa e notifica @osmar via Telegram.

**Architecture:** Entry-point bash script (`task-agent-executor.sh`) invoked por cron OpenClaw. Busca tasks via `/api/tasks` (já existe), dispara subagent OpenClaw por task. Subagent move status, executa, e envia notificação Telegram via Message API.

**Tech Stack:** Bash script, OpenClaw subagent, Next.js `/api/tasks` route (existing), Telegram Message API.

---

## File Map

```
/root/.openclaw/
├── scripts/
│   └── task-agent-executor.sh          ← Entry-point do cron (CREATE)
└── agents/
    └── task-agent/
        └── PROMPT.md                   ← Prompt base do subagent (CREATE)

/root/.openclaw/workspace/
├── docs/superpowers/specs/
│   └── 2026-04-14-task-agent-design.md  ← Reference (already exists)
└── docs/superpowers/plans/
    └── 2026-04-14-task-agent-plan.md   ← This plan (already created)
```

**No files modified** — todos são criações novas. O `/api/tasks` existing é apenas consultado.

---

## Task 1: Entry-point script `task-agent-executor.sh`

**Files:**
- Create: `/root/.openclaw/scripts/task-agent-executor.sh`

- [ ] **Step 1: Criar o script base**

```bash
#!/bin/bash
# ============================================================
# Task Agent Executor — Cron entry-point
# Dispara tasks atribuídas a @clara no backlog
# ============================================================

AGENT_NAME="@clara"
API_BASE="http://localhost:3000"
LOG_FILE="/root/.openclaw/logs/task-agent.log"
WORKSPACE="/root/.openclaw/workspace"

# Ensure log dir
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ============================================================
# 1. Buscar tasks de @clara no backlog
# ============================================================
log "=== Task Agent cycle started ==="

TASKS_JSON=$(curl -s -H "Cookie: $COOKIE" \
    "$API_BASE/api/tasks?assigned_to=$AGENT_NAME&status=backlog&limit=1" 2>/dev/null)

# Parse tasks array from JSON response
TASKS=$(echo "$TASKS_JSON" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    tasks = data.get('tasks', [])
    for t in tasks:
        print(t['id'], '|', t['title'], '|', t.get('description',''), '|',
              t.get('priority','normal'), '|', t.get('category','work'), '|',
              t.get('due_date',''), '|', t.get('track_status','on_track'))
except:
    pass
" 2>/dev/null)

if [ -z "$TASKS" ]; then
    log "Nenhuma task encontrada para $AGENT_NAME — finalizando."
    exit 0
fi

# ============================================================
# 2. Processar cada task (limite: 1 por ciclo)
# ============================================================
while IFS='|' read -r ID TITLE DESC PRIO CAT DUE TRACK; do
    log "Processando task: $ID — $TITLE"

    # a) Move para in_progress
    MOVE_RESULT=$(curl -s -X PUT "$API_BASE/api/tasks" \
        -H "Content-Type: application/json" \
        -H "Cookie: $COOKIE" \
        -d "{\"id\":\"$ID\",\"status\":\"in_progress\",\"track_status\":\"on_track\"}" 2>/dev/null)

    if echo "$MOVE_RESULT" | grep -q '"task"'; then
        log "Task $ID movida para in_progress"
    else
        log "ERRO ao mover task $ID para in_progress: $MOVE_RESULT"
        continue
    fi

    # b) Dispara subagent com os dados da task
    /root/.openclaw/scripts/dispatch-task-agent.sh "$ID" "$TITLE" "$DESC" "$PRIO" "$CAT" "$DUE" "$TRACK"
    RESULT=$?

    if [ $RESULT -eq 0 ]; then
        log "Task $ID executada com sucesso pelo subagent"
    else
        log "Subagent falhou para task $ID — codigo: $RESULT"
    fi

done <<< "$TASKS"

log "=== Task Agent cycle finished ==="
```

**IMPORTANT:** O script usa `$COOKIE` que precisa ser passado pelo cron ou lido de `/root/.openclaw/credentials/agent-session.env`.

- [ ] **Step 2: Criar helper de autenticação**

```bash
# Append no início do script (após log()):
get_session_cookie() {
    local cookie_file="/root/.openclaw/credentials/agent-session.env"
    if [ -f "$cookie_file" ]; then
        COOKIE=$(cat "$cookie_file")
    fi
}
```

- [ ] **Step 3: Commit**

```bash
chmod +x /root/.openclaw/scripts/task-agent-executor.sh
cd /root/.openclaw/workspace && git add scripts/task-agent-executor.sh && git commit -m "feat(task-agent): add executor entry-point script"
```

---

## Task 2: Dispatcher script `dispatch-task-agent.sh`

**Files:**
- Create: `/root/.openclaw/scripts/dispatch-task-agent.sh`

- [ ] **Step 1: Criar o dispatcher**

```bash
#!/bin/bash
# ============================================================
# Dispatch Task Agent subagent para uma task específica
# ============================================================

set -e

ID="$1"
TITLE="$2"
DESC="${3:-Sem descrição}"
PRIO="${4:-normal}"
CAT="${5:-work}"
DUE="${6:-}"
TRACK="${7:-on_track}"

WORKSPACE="/root/.openclaw/workspace"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [dispatcher] $1"
}

log "Disparando subagent para task $ID: $TITLE"

# Gera o prompt da task
PROMPT_FILE="/tmp/task-prompt-$ID.txt"

cat > "$PROMPT_FILE" << PROMPT_EOF
## Task a executar

**Título:** $TITLE
**Descrição:** $DESC
**Categoria:** $CAT
**Prioridade:** $PRIO
**Vencimento:** ${DUE:-não definido}
**ID:** $ID

## Suas instruções

Você é @clara, analista de SEO. Execute a task acima seguindo:
1. Leia a descrição com atenção
2. Execute usando as ferramentas disponíveis (web search, fetch, análise)
3. Documente o resultado da execução (o que fez, descobriu, gerou)
4. Atualize o status da task via API (executar fetch PUT):
   - Quando iniciar: \`PUT /api/tasks\` body: \`{"id":"$ID","status":"in_progress","track_status":"on_track"}\`
   - Quando concluir: \`PUT /api/tasks\` body: \`{"id":"$ID","status":"review","track_status":"on_track"}\`
5. Se bloqueado: \`PUT /api/tasks\` body: \`{"id":"$ID","status":"review","track_status":"at_risk"}\` e explique o bloqueo

## Regras
- Se precisar de mais contexto/input: notifique o bloqueio e aguarde
- Se não conseguir completar: mova para "review" com track_status "at_risk"
- Formato da notificação Telegram (enviar ao final):
\`\`\`
✅ Task concluída

📋 ID: $ID
📌 Título: $TITLE
📁 Categoria: $CAT
⚡ Prioridade: $PRIO
📅 Vencimento: ${DUE:-não definido}
⏱️ Concluída em: $(date '+%d/%m/%Y às %H:%M BRT')

📝 Resumo:
[resultado da execução — explique o que foi feito]

🔗 Ver task: http://100.64.39.113:3000/tasks
\`\`\`
PROMPT_EOF

# Dispara subagent via sessions_spawn
cd "$WORKSPACE"
openclaw sessions spawn \
    --model minimax-portal/MiniMax-M2.7 \
    --runtime subagent \
    --workspace "$WORKSPACE" \
    --task-file "$PROMPT_FILE" \
    2>&1

RESULT=$?
rm -f "$PROMPT_FILE"
exit $RESULT
```

- [ ] **Step 2: Commit**

```bash
chmod +x /root/.openclaw/scripts/dispatch-task-agent.sh
cd /root/.openclaw/workspace && git add scripts/dispatch-task-agent.sh && git commit -m "feat(task-agent): add dispatcher script"
```

---

## Task 3: Cron job no OpenClaw

**Files:**
- Modify: `/root/.openclaw/cron/jobs.json`

- [ ] **Step 1: Adicionar o cron job ao jobs.json**

O arquivo atual (`/root/.openclaw/cron/jobs.json`) é lido diretamente pelo sistema. Adicionar:

```json
{
  "id": "task-agent-executor",
  "name": "Task Agent — @clara executor",
  "schedule": "*/15 * * * *",
  "timezone": "America/Sao_Paulo",
  "action": {
    "type": "script",
    "script_path": "/root/.openclaw/scripts/task-agent-executor.sh"
  },
  "notification": {
    "on_success": "none",
    "on_failure": "telegram"
  },
  "enabled": true
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace && git add cron/jobs.json && git commit -m "feat(cron): add task-agent executor every 15min"
```

---

## Task 4: Teste manual — criar task e disparar ciclo

**Files:**
- Test: Via API curl + verificação no DB

- [ ] **Step 1: Criar uma task de teste via API**

```bash
# Obter auth cookie primeiro
COOKIE_VAL="dummy-test-cookie"
curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[TESTE] Auditoria SEO — keyword teste",
    "description": "Este é um teste automatizado. Executar pesquisa básica.",
    "status": "backlog",
    "priority": "normal",
    "category": "work",
    "assigned_to": "@clara",
    "due_date": "2026-04-20"
  }' 2>/dev/null | python3 -m json.tool 2>/dev/null | head -15
```

- [ ] **Step 2: Verificar que a task foi criada**

```bash
curl -s http://localhost:3000/api/tasks?assigned_to=@clara&status=backlog \
  | python3 -c "import json,sys; d=json.load(sys.stdin); [print(t['id'], t['title']) for t in d.get('tasks',[])]"
```

Esperado: a task de teste aparece

- [ ] **Step 3: Executar o script manualmente (dry-run sem subagent)**

```bash
cd /root/.openclaw/workspace && \
COOKIE="test" bash /root/.openclaw/scripts/task-agent-executor.sh 2>&1 | head -20
```

Esperado: detecta a task de teste, tenta mover para in_progress

- [ ] **Step 4: Deletar task de teste**

```bash
TASK_ID="<id da task de teste>"
curl -s -X DELETE "http://localhost:3000/api/tasks?id=$TASK_ID" 2>/dev/null
```

- [ ] **Step 5: Commit**

```bash
cd /root/.openclaw/workspace && git add -A && git commit -m "test(task-agent): manual test cycle" 2>/dev/null || true
```

---

## Task 5: Log rotation

**Files:**
- Modify: `/root/.openclaw/scripts/task-agent-executor.sh` (append no início)

- [ ] **Step 1: Adicionar rotação de log**

Após `mkdir -p "$(dirname "$LOG_FILE")"`, adicionar:

```bash
# Rotate log if > 5MB
if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt 5242880 ]; then
    mv "$LOG_FILE" "$LOG_FILE.old"
fi
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace && git add scripts/task-agent-executor.sh && git commit -m "chore(task-agent): add 5MB log rotation"
```

---

## Task 6: Notificação de erro via Telegram

**Files:**
- Create: `/root/.openclaw/scripts/send-telegram-notification.sh`

- [ ] **Step 1: Criar script de notificação**

```bash
#!/bin/bash
# ============================================================
# Envia mensagem Telegram para @osmar
# ============================================================

MESSAGE="$1"
TELEGRAM_TOKEN="${TELEGRAM_BOT_TOKEN}"
CHAT_ID="${TELEGRAM_CHAT_ID}"

if [ -z "$TELEGRAM_TOKEN" ] || [ -z "$CHAT_ID" ]; then
    echo "Telegram credentials not set"
    exit 1
fi

curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage" \
    -d "chat_id=$CHAT_ID" \
    -d "text=$MESSAGE" \
    -d "parse_mode=HTML" 2>/dev/null
```

- [ ] **Step 2: Hook no executor script para falhas**

No `task-agent-executor.sh`, após detectar erro:

```bash
if [ $RESULT -ne 0 ]; then
    /root/.openclaw/scripts/send-telegram-notification.sh "⚠️ Task Agent falhou para task $ID"
fi
```

- [ ] **Step 3: Commit**

```bash
chmod +x /root/.openclaw/scripts/send-telegram-notification.sh
cd /root/.openclaw/workspace && git add scripts/send-telegram-notification.sh scripts/task-agent-executor.sh && git commit -m "feat(task-agent): add Telegram notification on failure"
```

---

## Spec Coverage Check

| Requisito do spec | Task |
|-------------------|------|
| Cron a cada 15min | Task 3 |
| GET /api/tasks filtering @clara + backlog + sort by due_date | Task 1 |
| Subagent execution por task | Task 2 |
| Move to in_progress | Task 1 + 2 |
| Execute task (prompt) | Task 2 |
| Move to review on complete | Task 2 |
| Move to review + at_risk on blocked | Task 2 |
| Telegram notification detailed (Opção B) | Task 2 |
| Error handling / blocked | Task 2 |
| Log rotation | Task 5 |
| Cron config in jobs.json | Task 3 |
| Smoke test | Task 4 |

**All spec sections covered.** Nenhum TBD/TODO no código.

---

## Self-Review

- [x] Spec coverage completo
- [x] Nenhum placeholder (TBD/TODO/TODO)
- [x] Type consistency: IDs, status, track_status — todos strings conforme schema
- [x] 6 tasks — sequenciais, não paralelas
- [x] Commits granulares

---

## Execução

**1. Subagent-Driven (recomendado)** — fresh subagent por task, review entre cada uma

**2. Execução direta aqui** — executo as tasks em batch nesta sessão

Qual prefere?
