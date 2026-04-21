---
name: clickup-report
description: Relatório de tarefas do ClickUp por projeto e período. Usa quando Osmar solicitar "report ClickUp", "relatório de tarefas", "status do projeto no ClickUp", "tarefas do Santtas", ou qualquer análise de tasks do ClickUp. Parameters: projeto e período (dias para trás e dias para frente). After displaying results, ask if they want to generate an HTML report.
---

# ClickUp Report Skill

## When to Use

- `"report ClickUp"`, `"relatório de tarefas"`
- `"tarefas do Santtas"`, `"status do projeto"`
- `"o que foi feito na última semana?"`
- `"quais tarefas estão atrasadas?"`
- Any request for task/project status from ClickUp

## Workflow

### Step 1: Collect Parameters

Ask the user:
1. **Projeto** — which project? (e.g., `santtas`)
2. **Período** — how many days back? how many days forward? (default: 7, 7)

### Step 2: Run Report Script

```bash
python3 /root/.openclaw/workspace/skills/clickup-report/scripts/gerar_report.py [projeto] [dias_atras] [dias_frente]
```

Example:
```bash
python3 /root/.openclaw/workspace/skills/clickup-report/scripts/gerar_report.py santtas 7 7
```

### Step 3: Display Results

Show the structured output:
- Tasks by assignee (grouped)
- ✅ Finalizadas no período
- 🔴 Bloqueadas
- ⚠️ Atrasadas
- 📌 Próximas tarefas

### Step 4: Ask About HTML Report

After displaying results, ask:
> "Quer que eu gere um relatório HTML completo? Fica salvo em `reports/[projeto]/report-YYYY-MM-DD.html`."

If yes, run the script which automatically generates the HTML.

## Output Format

### Chat Report (text)
```
📋 Report ClickUp — SANTAS
🗓 Período: 14/04 a 21/04/2026 (hoje: 21/04/2026)

👥 TAREFAS POR PESSOA:
  [osmahoffmannjr]
    ✅ Finalizadas: 1
      - Pagamento do servidor EVEO (closed: 21/04/2026)
    📌 Próximas: 2
      - 22/04 | backlog | Gerar relatório de faturamento
      - 24/04 | revisão | Revisar documentação

📊 RESUMO:
  ✅ Finalizadas: 1
  🔴 Bloqueadas: 0
  ⚠️ Atrasadas: 0
  📌 Próximas (7 dias): 4
  🔵 Em progresso: 1
```

### HTML Report

Saved to: `/root/.openclaw/workspace/reports/[projeto]/report-YYYY-MM-DD.html`

Premium dark SaaS style (matches Mission Control aesthetic).

## Project IDs

Reference: `references/clickup-ids.md`

Current projects:
- `santtas` → Folder ID: `90178338470`, List ID: `901713135811`

## Notes

- Uses credentials from `/root/.openclaw/credentials/clickup.json`
- Tasks are grouped by assignee from ClickUp `assignees` field
- `bloqueio` status = blocked tasks
- `date_done` = when task was marked as closed
- `due_date` = deadline

## Files

```
clickup-report/
├── SKILL.md
├── scripts/
│   └── gerar_report.py    ← main report generator
└── references/
    └── clickup-ids.md    ← project IDs and API reference
```