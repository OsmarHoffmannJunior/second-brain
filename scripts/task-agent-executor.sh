#!/bin/bash
# Task Agent Executor — fetches backlog tasks assigned to @clara and dispatches them
# Part of Mission Control Task Agent feature

set -euo pipefail

# ─── Config ───────────────────────────────────────────────────────────────────
SCRIPT_DIR="/root/.openclaw/scripts"
LOG_FILE="/root/.openclaw/logs/task-agent.log"
AUTH_COOKIE="mc_auth=vpwpAfpLG2plBgk9MD+sUsSU+KXAlJl2Ut7TDoUmKw4="
API_BASE="http://localhost:3000/api/tasks"
DISPATCH_SCRIPT="${SCRIPT_DIR}/dispatch-task-agent.sh"

# ─── Log function ─────────────────────────────────────────────────────────────
log() {
    local level="${1:-INFO}"
    local msg="${2:-}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] ${msg}" >> "${LOG_FILE}"
}

# ─── Log rotation (5MB limit) ─────────────────────────────────────────────────
rotate_log() {
    if [[ -f "${LOG_FILE}" ]] && [[ $(stat -c%s "${LOG_FILE}" 2>/dev/null || echo 0) -gt 5242880 ]]; then
        mv "${LOG_FILE}" "${LOG_FILE}.old"
        log "INFO" "Log rotated (size > 5MB)"
    fi
}

# ─── Dispatch task (call child script, graceful if missing) ───────────────────
dispatch_task() {
    local id="$1"
    local title="$2"
    local desc="$3"
    local prio="$4"
    local cat="$5"
    local due="$6"

    if [[ -x "${DISPATCH_SCRIPT}" ]]; then
        bash "${DISPATCH_SCRIPT}" "${id}" "${title}" "${desc}" "${prio}" "${cat}" "${due}" || {
            log "ERROR" "dispatch-task-agent.sh failed for task ${id}"
            return 1
        }
    else
        log "WARN" "dispatch-task-agent.sh not found or not executable — skipping dispatch for ${id}"
    fi
}

# ─── Main ──────────────────────────────────────────────────────────────────────
log "INFO" "=== Task Agent Executor started ==="
rotate_log

# Fetch backlog tasks assigned to @clara
RESPONSE=$(curl -s "${API_BASE}?assigned_to=@clara&status=backlog" \
    -H "Content-Type: application/json" \
    -H "Cookie: ${AUTH_COOKIE}" 2>&1)

if ! echo "${RESPONSE}" | python3 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
    log "ERROR" "Failed to fetch tasks or parse JSON: ${RESPONSE}"
    exit 1
fi

log "DEBUG" "API response received"

# Count tasks using Python
TASK_COUNT=$(echo "${RESPONSE}" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('tasks',[])))")

if [[ "${TASK_COUNT}" -eq 0 ]]; then
    log "INFO" "Nenhuma task encontrada"
    log "INFO" "=== Task Agent Executor finished ==="
    exit 0
fi

log "INFO" "Found ${TASK_COUNT} task(s) to process"

# Process each task individually — avoids multi-line description parsing issues
echo "${RESPONSE}" | python3 -c "
import json, sys

data = json.load(sys.stdin)
tasks = data.get('tasks', [])

for t in tasks:
    task_id   = t.get('id', '')
    title     = t.get('title', '')
    desc      = t.get('description') or ''
    priority  = t.get('priority', 'normal')
    category  = t.get('category', 'work')
    due_date  = t.get('due_date') or ''
    # Print one task per line, fields joined by |
    # Using \x00 as safe delimiter (null byte)
    print(task_id, title, desc, priority, category, due_date, sep='|')
" 2>/dev/null | while IFS='|' read -r task_id title desc priority category due_date; do
    [[ -z "${task_id}" ]] && continue

    log "INFO" "Processing task ${task_id}: ${title}"

    # Move to in_progress
    UPDATE_RESP=$(curl -s -X PUT "${API_BASE}" \
        -H "Content-Type: application/json" \
        -H "Cookie: ${AUTH_COOKIE}" \
        -d "{\"id\":\"${task_id}\",\"status\":\"in_progress\",\"track_status\":\"on_track\"}" 2>&1)

    if echo "${UPDATE_RESP}" | python3 -c "import json,sys; r=json.load(sys.stdin); sys.exit(0 if 'task' in r else 1)" 2>/dev/null; then
        log "DEBUG" "Task ${task_id} moved to in_progress"
    else
        log "WARN" "Failed to update task ${task_id}: ${UPDATE_RESP}"
    fi

    # Dispatch to child script
    dispatch_task "${task_id}" "${title}" "${desc}" "${priority}" "${category}" "${due_date}"
    log "INFO" "Task ${task_id} dispatched"
done

log "INFO" "=== Task Agent Executor finished ==="
exit 0