#!/bin/bash
# draft-content.sh — Gera primeiros drafts de conteúdo
# Usage: ./draft-content.sh <type> <topic> <tone>

TYPE="$1"
TOPIC="$2"
TONE="$3"
STATE_DIR="/root/.openclaw/workspace/automation/state"
TELEGRAM_CHAT_ID="852627132"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$1" \
    -d parse_mode="Markdown" 2>/dev/null
}

DRAFT=""

case "$TYPE" in
  email)
    DRAFT="📧 *Draft de Email*\n\n"
    DRAFT+="**Assunto:** ${TOPIC}\n\n"
    DRAFT+="Olá [nome],\n\n"
    DRAFT+="[Parágrafo de abertura - contexto sobre ${TOPIC}]\n\n"
    DRAFT+="[Corpo principal - benefícios e detalhes]\n\n"
    DRAFT+="[CTA - chamada para ação]\n\n"
    DRAFT+="Abraços,\n[Seu nome]"
    ;;
  post)
    DRAFT="📱 *Draft de Post*\n\n"
    DRAFT+="${TOPIC}\n\n"
    DRAFT+="[Hook - primeira linha que prende]\n\n"
    DRAFT+="[3-5 pontos principais]\n\n"
    DRAFT+="#${TYPE// / #}"
    ;;
  proposal)
    DRAFT="📄 *Proposta Comercial*\n\n"
    DRAFT+="**Projeto:** ${TOPIC}\n\n"
    DRAFT+="*1. Situação Atual*\n[Descreva o problema/oportunidade]\n\n"
    DRAFT+="*2. Proposta*\n[O que você vai fazer]\n\n"
    DRAFT+="*3. Investimento*\n[R$ xxx,xx]\n\n"
    DRAFT+="*4. Prazo*\n[xxx dias]\n\n"
    DRAFT+="*5. Próximos Passos*\n[Etapas]"
    ;;
  ata)
    DRAFT="📝 *Ata de Reunião*\n\n"
    DRAFT+="**Data:** $(date '+%d/%m/%Y')\n"
    DRAFT+="**Pauta:** ${TOPIC}\n\n"
    DRAFT+="*Participantes:*\n[Lista]\n\n"
    DRAFT+="*Discussões:*\n[Pontos levantados]\n\n"
    DRAFT+="*Decisões:*\n[O que foi decidido]\n\n"
    DRAFT+="*Ações:*\n[ ] [responsável] - [tarefa] (prazo)"
    ;;
  *)
    DRAFT="📝 *Draft*\n\n${TOPIC}\n\n[Conteúdo gerado]"
    ;;
esac

send_telegram "$DRAFT
---

_⚠️ Revise antes de usar. Tom: ${TONE:-direto}_"
