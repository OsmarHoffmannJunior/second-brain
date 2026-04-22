---
name: serprobot-reports
description: Relatórios de ranking de keywords via API do SerproBot para o projeto Santtas (ID 1262084). Usa quando Osmar perguntar sobre "SerproBot", "ranking de keywords", "posição no Google", "keywords do Santtas", ou pedir para analisar relatório de ranking. Baseado em project_report com 248 keywords monitoradas. SEMPRE usar esta skill quando uma URL do SerproBot for mencionada — nunca acessar a API diretamente via web_fetch.
---

# SerproBot Reports — Skill de Ranking SEO

## Quando Usar

- `"SerproBot"`, `"serprobot"`
- `"ranking de keywords"`, `"posição no Google"`
- `"keywords do Santtas"`, `"relatório de ranking"`
- `"compare Curitiba com Londrina"` (análise cruzada de keywords)
- Qualquer análise de posição de keywords do Santtas

## Interpretação dos Dados

⚠️ **Regra principal (não intuitiva):**
- `change` **negativo** → keyword **melhorou** (subiu no ranking)
- `change` **positivo** → keyword **perdeu** posições (caiu no ranking)

Exemplos:
- `change: -17` em "Acompanhantes Anápolis" → melhorou 17 posições
- `change: +8` em "Acompanhantes Curitiba" → caiu 8 posições

## Campos disponíveis

| Campo | Significado |
|---|---|
| `keyword_id` | ID único no SerproBot |
| `change` | Variação vs última verificação do SerproBot |
| `earliest_position` | Pior posição no período (30 dias) |
| `latest_position` | Posição atual |
| `best_ever_position` | Melhor posição já registrada (menor número) |
| `first_ever_position` | null = keyword recém-adicionada |
| `found_serp` | URL rankeando no Google |

## Projetos

O `project_id` na URL determina qual projeto é consultado:
- `1262084` = Santtas (248 keywords, 30 dias)
- Outros IDs = outros projetos (ainda não mapeados)

## Script de Busca

```bash
python3 /root/.openclaw/workspace/skills/serprobot-reports/scripts/buscar_ranking.py [project_id] [keyword]
```

- Sem argumentos: usa `project_id=1262084` (Santtas), busca todas 248 keywords
- Com `project_id`: consulta projeto específico
- Com `keyword`: filtra resultado pela keyword

Sem argumento: busca relatório completo de todas as 248 keywords.
Com argumento: filtra pela keyword específica.

Dados salvos em `/tmp/serprobot_report.json`.

## Análise de Múltiplas Keywords

Para comparar keywords (ex: "Anápolis vs Brasília"):
```bash
python3 /root/.openclaw/workspace/skills/serprobot-reports/scripts/buscar_ranking.py Anápolis
python3 /root/.openclaw/workspace/skills/serprobot-reports/scripts/buscar_ranking.py Brasília
```

## Fontes de Dados

- **SerproBot:** 248 keywords, período 30 dias (21/mar–20/abr/2026)
- **GSC:** dados oficiais do Google (cliques, impressões, CTR, posição)

Usar GSC como fonte primária para volume e cliques. SerproBot para posição de ranking específica.

## Análise Cruzada — GSC vs SerproBot

Quando uma keyword aparece nos dois:
- Se GSC mostra queda mas SerproBot mostra `change` negativo → queda é real
- Se GSC estável mas SerproBot `change` positivo → perderam posições no ranking

## Arquivos

```
serprobot-reports/
├── SKILL.md                  ← este arquivo
├── scripts/
│   └── buscar_ranking.py   ← busca API + análise de keywords
└── references/
    └── serprobot-api.md    ← guia completo de interpretação
```