# integrations/tools.md — Mapa de Ferramentas e Acessos

---

## Ferramentas Ativas

| Ferramenta | Plugin/ID | Status | Notas |
|------------|-----------|--------|-------|
| OpenClaw | gateway | ✅ ativo | MiniMax-M2.7 |
| Telegram | messaging.telegram | ✅ conectado | Bot token configurado |
| Google Sheets | apps-script | 🔧 em uso | Automação de planilhas |
| Gemini | llm | 🔧 em uso | API key configurada |
| MiniMax | llm | 🔧 em uso | Modelo principal |
| Typebot | chatbot | 🔧 em uso | - |
| n8n | automation | 🔧 em uso | - |
| UFW | firewall | ✅ configurado | Server hardening |
| Fail2Ban | security | ✅ configurado | Server hardening |

---

## IDs e Acessos (não exponha esses dados)

| Serviço | ID/Token | Local | Notas |
|---------|----------|-------|-------|
| Telegram Bot | `TG_BOT_TOKEN` | `automation/state/config-bridge.sh` | Não mostrar em plaintext |
| OpenClaw Gateway | local | `localhost:18789` | - |

---

## Credenciais

⚠️ **Nunca expor tokens ou chaves em texto puro no chat.**

| Serviço | Tipo | Onde está |
|---------|------|-----------|
| MiniMax API | key | Variável de ambiente |
| Gemini API | key | Variável de ambiente |
| Telegram Bot | token | `automation/state/config-bridge.sh` |

---

## Feedback de Integrações

| Integração | Status | Problema |
|------------|--------|----------|
| - | - | - |

---

_Last updated: 2026-04-13_
