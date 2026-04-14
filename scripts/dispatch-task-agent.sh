#!/bin/bash
# ============================================================
# Dispatch Task Agent subagent for a specific task
# Uses OpenClaw gateway WebSocket RPC to spawn subagent
# ============================================================

set -euo pipefail

ID="$1"
TITLE="$2"
DESC="${3:-Sem descrição}"
PRIO="${4:-normal}"
CAT="${5:-work}"
DUE="${6:-}"
TRACK="${7:-on_track}"

AUTH_COOKIE="mc_auth=vpwpAfpLG2plBgk9MD+sUsSU+KXAlJl2Ut7TDoUmKw4="
GW_URL="ws://127.0.0.1:18789"
GW_TOKEN="e05f77d029aa4b05d7138adc52ad26abb6848bcfcdba7248"
PROMPT_FILE="/tmp/task-prompt-${ID}.txt"
SPAWN_SCRIPT="/tmp/spawn-subagent.py"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [dispatcher] $1"; }

# ─── Ensure spawn script exists ────────────────────────────
if [ ! -f "$SPAWN_SCRIPT" ]; then
    cat > "$SPAWN_SCRIPT" << 'PYEOF'
#!/usr/bin/env python3
"""Spawn a subagent via OpenClaw gateway WebSocket RPC."""
import sys, os, json, time, threading, uuid
import websocket

GW_URL = "ws://127.0.0.1:18789"
TOKEN = "e05f77d029aa4b05d7138adc52ad26abb6848bcfcdba7248"

def spawn(task_prompt: str, workspace: str) -> str:
    session_id = str(uuid.uuid4())
    req_id = [1]
    def send(wc, msg):
        req_id[0] += 1
        wc.send(json.dumps({**msg, "id": req_id[0]}))
    ws = websocket.WebSocket()
    ws.connect(GW_URL, header=[f"Authorization: Bearer {TOKEN}"])
    result = {"done": False, "output": ""}
    def reader():
        while not result["done"]:
            try:
                msg = json.loads(ws.recv())
                if msg.get("result", {}).get("sessionKey"):
                    result["sessionKey"] = msg["result"]["sessionKey"]
                if "output" in msg.get("result", {}):
                    result["output"] += msg["result"].get("output", "")
                if msg.get("result", {}).get("done"):
                    result["done"] = True
            except: break
    t = threading.Thread(target=reader, daemon=True)
    t.start()
    send(ws, {"jsonrpc": "2.0", "method": "sessions.spawn",
              "params": {
                  "task": task_prompt,
                  "workspace": workspace,
                  "runtime": "subagent",
                  "model": "minimax-portal/MiniMax-M2.7"
              }})
    time.sleep(2)
    send(ws, {"jsonrpc": "2.0", "method": "threads.send",
              "params": {"sessionKey": result.get("sessionKey", ""), "message": task_prompt}})
    for _ in range(90):
        if result["done"]: break
        time.sleep(1)
    ws.close()
    return result.get("output", "")
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: spawn-subagent.py <prompt-file> <workspace>", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1]) as f: prompt = f.read()
    output = spawn(prompt, sys.argv[2])
    print(output)
PYEOF
    chmod +x "$SPAWN_SCRIPT"
fi

# ─── Build task prompt ─────────────────────────────────────
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
4. Atualize o status da task via API (usar exec tool com curl):
   - Iniciar: \`curl -s -X PUT http://localhost:3000/api/tasks -H "Content-Type: application/json" -H "Cookie: $AUTH_COOKIE" -d "{\\"id\\":\\"$ID\\",\\"status\\":\\"in_progress\\",\\"track_status\\":\\"on_track\\"}"\`
   - Concluir: \`curl -s -X PUT http://localhost:3000/api/tasks -H "Content-Type: application/json" -H "Cookie: $AUTH_COOKIE" -d "{\\"id\\":\\"$ID\\",\\"status\\":\\"review\\",\\"track_status\\":\\"on_track\\"}"\`
5. Se bloqueado: curl PUT com "review" + "at_risk" e explique o bloqueio

## Notificação Telegram (enviar via message tool, channel=telegram, target=852627132):
\`\`\`
✅ Task concluída

📋 ID: $ID
📌 Título: $TITLE
📁 Categoria: $CAT
⚡ Prioridade: $PRIO
📅 Vencimento: ${DUE:-não definido}
⏱️ Concluída em: $(date '+%d/%m/%Y às %H:%M BRT')

📝 Resumo:
[resumo do que foi feito]

🔗 Ver task: http://100.64.39.113:3000/tasks
\`\`\`

Se bloqueado:
\`\`\`
⚠️ Task bloqueada

📋 ID: $ID
📌 Título: $TITLE
📁 Motivo: [explicação do que falta]
📝 O que preciso: [input necessário]

🔗 Ver task: http://100.64.39.113:3000/tasks
\`\`\`
PROMPT_EOF

log "Disparando subagent para task $ID: $TITLE"

# ─── Spawn via WebSocket ────────────────────────────────────
python3 "$SPAWN_SCRIPT" "$PROMPT_FILE" /root/.openclaw/workspace 2>&1 || true

rm -f "$PROMPT_FILE"
log "Dispatcher finished for task $ID"
