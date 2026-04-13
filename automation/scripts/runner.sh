#!/bin/bash
# runner.sh — Dispatcher principal para automações
# Usage: ./runner.sh <task> [args...]

SCRIPT_DIR="/root/.openclaw/workspace/automation/scripts"
STATE_DIR="/root/.openclaw/workspace/automation/state"
CONFIG="/root/.openclaw/workspace/automation/config.yaml"

# Carrega config bridge (variáveis de ambiente)
if [ -f "${STATE_DIR}/config-bridge.sh" ]; then
  source "${STATE_DIR}/config-bridge.sh"
fi

case "$1" in
  monitor)
    "${SCRIPT_DIR}/monitor-content.sh" "${2:-all}"
    ;;
  translate)
    "${SCRIPT_DIR}/translate-content.sh" "$2" "$3"
    ;;
  summarize)
    "${SCRIPT_DIR}/summarize-video.sh" "$2"
    ;;
  price)
    "${SCRIPT_DIR}/monitor-prices.sh" "$2" "$3" "$4" "$5"
    ;;
  task)
    shift
    "${SCRIPT_DIR}/task-manager.sh" "$@"
    ;;
  draft)
    shift
    "${SCRIPT_DIR}/draft-content.sh" "$@"
    ;;
  research)
    shift
    "${SCRIPT_DIR}/market-research.sh" "$@"
    ;;
  organize)
    "${SCRIPT_DIR}/organize-files.sh" "$2" "$3"
    ;;
  generate-image)
    # Chamado via tool, não shell
    ;;
  all)
    # Run all periodic checks
    "${SCRIPT_DIR}/monitor-content.sh" "all"
    "${SCRIPT_DIR}/monitor-prices.sh" "check"
    "${SCRIPT_DIR}/task-manager.sh" "remind"
    ;;
  *)
    echo "Usage: runner.sh <task> [args]"
    echo "Tasks: monitor, translate, summarize, price, task, draft, research, organize, all"
    ;;
esac
