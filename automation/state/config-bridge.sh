#!/bin/bash
# config-bridge.sh — Carrega variáveis de ambiente do .env
# NÃO COLOQUE CREDENCIAIS AQUI — use .env

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ -f "${SCRIPT_DIR}/.env" ]; then
  set -a  # exportar automaticamente variáveis definidas
  source "${SCRIPT_DIR}/.env"
  set +a
else
  echo "WARNING: .env não encontrado em ${SCRIPT_DIR}/.env"
fi
