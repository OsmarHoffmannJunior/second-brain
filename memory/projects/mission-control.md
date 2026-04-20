# memory/projects/mission-control.md — Mission Control

---

## metadata

| Campo | Valor |
|-------|-------|
| Nome | Mission Control |
| Status | active |
| Início | 2026-04-13 |
| Última atualização | 2026-04-13 |

---

## Objetivo

Arquitetura modular de agentes via arquivos `.MD`.  
Agentes especializados que se comunicam via arquivos e sinais, em vez de um monolito.

**Visão**: ter um "centro de comando" onde cada agente faz uma coisa e comunica via triggers.

---

## Stack / Tecnologia

- OpenClaw (gateway + agents)
- MiniMax-M2.7 (modelo principal)
- Google Sheets (persistência + interface)
- Typebot (chat triggers)
- n8n (automação de workflows)
- RSS/Telegram (monitoramento)

---

## Responsáveis

| Nome | Papel |
|------|-------|
| Osmar | Dono do projeto |
| Clara | Agente principal (gateway) |

---

## Arquitetura Planejada

```
Mission Control/
├── agents/
│   ├── router.md         # Direciona solicitações
│   ├── researcher.md     # Pesquisa e monitoramento
│   ├── writer.md         # Criação de conteúdo
│   ├── analyst.md        # Análise de dados
│   └── executor.md       # Execução de tarefas
├── signals/
│   └── TODO.md           # Fila de tarefas
├── memory/               # Memória compartilhada
└── outputs/              # Resultados dos agentes
```

---

## Marcos ( milestones )

| Marco | Status | Data | Notas |
|-------|--------|------|-------|
| Definir arquitetura base | done | 2026-04-13 | Decidido via conversa |
| Implementar agente router | pending | - | - |
| Implementar agente researcher | pending | - | - |
| Integrar com Google Sheets | pending | - | - |
| Integrar com Telegram | pending | - | - |

---

## Skills Disponíveis no Mission Control

### multi-search-engine-2 (instalada 2026-04-19)
- **Path:** `/root/.openclaw/workspace/skills/multi-search-engine-2/SKILL.md`
- **Descrição:** Busca em 17 motores (Google, Bing, DuckDuckGo, Baidu, Brave, etc.) via web_fetch, sem API keys
- **Engines:** 8 CN (Baidu, Sogou, WeChat, etc.) + 9 globais (Google, Bing, DuckDuckGo, Startpage, Brave, Ecosia, Qwant, WolframAlpha)
- **Utilidade para SEO:**
  - Pesquisa de keywords (exploratória, sem API)
  - Análise de SERP (resultados reais sem API GSC)
  - Competitor intel: `site:concorrente.com.br` para ver indexed pages
  - Rankings manuais em diferentes engines/regiões
  - Filtros temporais: `tbs=qdr:w` (última semana), `tbs=qdr:m` (último mês)
  - DuckDuckGo Bangs: `!g`, `!gh`, `!so`, `!w`, `!yt`
- **Quando usar:** Quando Osmar solicitar "pesquisa de keywords" ou "pesquisa de concorrentes" → sugerir usar multi-search-engine primeiro
- **Instalar via:** `openclaw skills install multi-search-engine-2`

| Tarefa | Prioridade | Responsável | Deadline | Notas |
|--------|------------|-------------|----------|-------|
| Escolher primeira automação das 10 | high | Osmar | 2026-04-13 | Aguardando escolha |
| Definir formato de sinais entre agentes | medium | Osmar | - | - |

---

## Histórico

| Data | Evento |
|------|--------|
| 2026-04-13 | Projeto criado; Osmar explicou a visão |

---

_Last updated: 2026-04-13_
