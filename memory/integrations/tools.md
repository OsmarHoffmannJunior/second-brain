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

⚠️ **Regra INVIOLÁVEL**: senhas e tokens vão **apenas em `.env`**, em nenhum outro lugar.

| Serviço | ID/Token | Local | Notas |
|---------|----------|-------|-------|
| Telegram Bot | `TG_BOT_TOKEN` | `.env` ✅ | Não mostrar em plaintext |
| OpenClaw Gateway | local | `localhost:18789` | - |

---

## Credenciais

⚠️ **Nunca expor tokens ou chaves em texto puro no chat. Apenas .env.**

| Serviço | Tipo | Onde está |
|---------|------|-----------|
| MiniMax API | key | `.env` |
| Gemini API | key | `.env` |
| Telegram Bot | token | `.env` (a migrar de `automation/state/config-bridge.sh`) |

---

## Feedback de Integrações

| Integração | Status | Problema |
|------------|--------|----------|
| - | - | - |

---

_Last updated: 2026-04-13_
