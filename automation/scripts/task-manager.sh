#!/bin/bash
# task-manager.sh — Gerenciador de tarefas com lembretes
# Usage: ./task-manager.sh [add <task> <deadline> | list | done <id> | remind]

ACTION="$1"
CONFIG="/root/.openclaw/workspace/automation/config.yaml"
STATE_DIR="/root/.openclaw/workspace/automation/state"
TASK_DB="${STATE_DIR}/tasks.db"
TELEGRAM_CHAT_ID="852627132"

mkdir -p "$STATE_DIR"
touch "$TASK_DB"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$1" \
    -d parse_mode="Markdown" 2>/dev/null
}

add_task() {
  local task="$2" deadline="$3"
  local id=$(date +%s)
  echo "${id}|${task}|${deadline}|pending|$(date +%s)" >> "$TASK_DB"
  send_telegram "✅ *Tarefa adicionada*\n\n📌 ${task}\n⏰ Até: ${deadline}\n\nID: \`${id}\`"
}

list_tasks() {
  local msg="📋 *Tarefas Ativas:*\n\n"
  local count=0
  while IFS='|' read -r id task deadline status _; do
    [ "$status" = "done" ] && continue
    count=$((count+1))
    msg+="${count}. ${task}\n   ⏰ ${deadline} | ID: \`${id}\`\n\n"
  done < "$TASK_DB"

  [ $count -eq 0 ] && msg="✅ Nenhuma tarefa ativa."
  send_telegram "$msg"
}

mark_done() {
  local id="$2"
  sed -i "s/^${id}|/&done|/g" "$TASK_DB"
  send_telegram "✅ Tarefa concluída!"
}

check_reminders() {
  local now=$(date +%s)
  local threshold=$((now - 3600)) # últimas 1 hora

  while IFS='|' read -r id task deadline status added; do
    [ "$status" = "done" ] && continue
    # Suporta deadline em formato "2026-04-15 14:00" ou timestamp
    deadline_ts=$(date -d "$deadline" +%s 2>/dev/null || echo "$deadline")
    diff=$((deadline_ts - now))

    if [ $diff -le 0 ]; then
      send_telegram "🚨 *TAREFA VENCIDA!*\n\n📌 ${task}\n⏰ Venceu: ${deadline}"
    elif [ $diff -le 7200 ]; then
      send_telegram "⏰ *Lembretes*\n\n📌 ${task}\n⏰ Vence em ~$((diff/60)) min"
    fi
  done < "$TASK_DB"
}

case "$ACTION" in
  add) add_task "$@" ;;
  list) list_tasks ;;
  done) mark_done "$@" ;;
  remind) check_reminders ;;
  *) send_telegram "Usage:\n• /task add <desc> <deadline>\n• /task list\n• /task done <id>" ;;
esac
