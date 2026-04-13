# business-context.md — Contexto de Negócio Recorrente

---

## Models de Negócio

| Modelo | Notas |
|--------|-------|
| SEO Agency | Modelo principal do Osmar |
| Liven Casa | Faturamento + traffic |
| Equipe Santtas Brasil | Projeto/equipe |

---

## Tecnologias e Preferências

| Tecnologia | Uso | Notas |
|------------|-----|-------|
| Next.js | Frontend | - |
| Tailwind CSS | Estilização | - |
| Docker | Containerização | - |
| Linux (Ubuntu/Debian) | Server | - |
| Google Sheets | Automação | Planilhas com Apps Script |
| Gemini + MiniMax | LLM APIs | - |
| Typebot | Chatbot/automação | Em uso |
| n8n | Automação | Em uso |

---

## Regras de Negócio

| Regra | Contexto |
|-------|----------|
| timezone BRT (UTC-3) | Todo scheduling em Horário de Brasília |
| Portuguese | Qualquer conteúdo para clientes/empresa em PT-BR |

---

## compliance/Tributário

| Tema | Status | Notas |
|------|--------|-------|
| Tax Reform | Monitoring | Reforma tributária brasileira |
| Compliance | Em curso | Necessário acompanhar mudanças |

---

## SEO / Marketing

| Área | Foco | Notas |
|------|------|-------|
| Local SEO | Itapema/SC | OTM para cliente local |
| Link Building | - | Palavra-chave principal |
| MiniMax | Modelo usado | Experiments com novo modelo |
| OpenClaw | Gateway + agents | Arquitetura Mission Control |

---

## projeto: Mission Control

Arquitetura modular de agentes via arquivos `.MD`.

**Objetivo**: ter agentes especializados que se comunicam via arquivos e sinais, em vez de um monolito.

**Stack planejada**:
- OpenClaw como gateway
- MiniMax-M2.7 como cérebro
- Google Sheets como persistência
- Typebot + n8n como trigger

**Status**: em construção.

---

_Last updated: 2026-04-13_
