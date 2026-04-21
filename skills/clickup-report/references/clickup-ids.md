# ClickUp — IDs e Estrutura (Hoff Consultoria)

## Credenciais
- **API Token:** `pk_55086979_PU3CKREB0NR3VVJQIFAQ687M6BKETA3D`
- **Workspace:** `9007105439` (Hoff Consultoria)
- **Space:** `90175347951` (Projetos)

## Estrutura de Projetos

```
Space: Projetos (90175347951)
└── Folder: Santtas (90178338470)
    └── List: SEO (901713135811)
```

## IDs Conhecidos

| Projeto | Folder ID | List ID |
|---------|-----------|---------|
| Santtas | 90178338470 | 901713135811 |

## Status Workflow (por lista)

Cada lista pode ter statuses customizados. Status padrão:
- `backlog` — inicial
- `in progress` — em progresso
- `revisão` — em revisão
- `bloqueio` — bloqueada
- `feito` / `closed` — finalizada

## Formato de Data na API

Timestamps em milliseconds (epoch ms).
Due dates: `due_date`
Data de conclusão: `date_done`

## Prioridades

| ID | Nível |
|----|-------|
| 1 | Urgent |
| 2 | High |
| 3 | Normal |
| 4 | Low |

## Filtros da API

- `include_closed=true` — inclui tasks fechadas
- `due_dategte=<ts>` — tasks com due >= timestamp
- `due_datelte=<ts>` — tasks com due <= timestamp
- `date_done_gte=<ts>` — tasks finalizadas após timestamp
- `date_done_lte=<ts>` — tasks finalizadas antes de timestamp
