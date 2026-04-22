---
name: gsc-7-dias
description: Gerador automático de relatório SEO semanal do Google Search Console. Usa os últimos 7 dias completos disponíveis no GSC. Acionado quando Osmar diz "GSC 7 dias" ou "relatório semanal" seguido de um domínio GSC (ex: "sc-domain:br.santtas.com"). Gera um HTML completo com KPIs, comparativos YoY e WoW, queries que perderam/melhoraram posição, top pages, top queries, dispositivo e país. Salva em /root/.openclaw/workspace/mission-control/reports/ e envia pelo Telegram.
---

# GSC 7 Dias — Skill de Relatório SEO Semanal

## Quando Usar

- `"GSC 7 dias br.santtas.com"`
- `"GSC 7 dias sc-domain:br.santtas.com"`
- `"gera relatório semanal do santtas"`
- `"relatório seo semanal"`
- Qualquer variação que mencione GSC + 7 dias + domínio

## Fluxo de Execução

### Passo 1 — Identificar o domínio GSC

Se o domínio não for informado explicitamente, usar o padrão:
- `sc-domain:br.santtas.com` para Santtas

### Passo 2 — Buscar dados (script Python)

```bash
python3 /root/.openclaw/workspace/skills/gsc-7-dias/scripts/gerar_relatorio.py <gsc_site_url> [output_dir]
```

Exemplo:
```bash
python3 /root/.openclaw/workspace/skills/gsc-7-dias/scripts/gerar_relatorio.py sc-domain:br.santtas.com
```

O script:
1. Busca dados do GSC via OAuth2 (gog.py) para os últimos 7 dias completos
2. Calcula comparativos YoY (mesmo período, ano passado) e WoW (7 dias anteriores)
3. Compara posição de queries (últimos 30d vs 30-60d)
4. Salva os dados em `/tmp/gsc_7_dias_data.json`

### Passo 3 — Preencher template HTML

Ler `/tmp/gsc_7_dias_data.json` e o template em:
`/root/.openclaw/workspace/skills/gsc-7-dias/assets/template.html`

Preencher todas as variáveis `{{...}}` com os dados do JSON.

### Passo 4 — Salvar e Enviar

1. Salvar HTML em `/root/.openclaw/workspace/mission-control/reports/seo-recap-{data}.html`
2. Enviar via Telegram com caption resumindo os números principais

## Estrutura de Arquivos

```
gsc-7-dias/
├── SKILL.md                          ← este arquivo
├── scripts/
│   └── gerar_relatorio.py            ← busca dados GSC e salva JSON
└── assets/
    └── template.html                 ← template HTML do relatório
```

## Variáveis do Template

| Variável | Fonte |
|---|---|
| `{{period_label}}` | `from_dt.strftime('%d')` – `to_dt.strftime('%d %b %Y')` |
| `{{from_dt_str}}` | `datetime.fromisoformat(data['from_date']).strftime('%d') – ' + to_dt.strftime('%d %b %Y')` |
| `{{yoy_from_str}}` | Mesmo formato para período YoY |
| `{{yoy_pct}}` | `((curr.clicks/yoy.clicks)-1)*100` → `+X.X%` |
| `{{wow_pct}}` | `((curr.clicks/prev.clicks)-1)*100` → `+X.X%` ou `-X.X%` |
| `{{wow_color}}` | `red` se wow_change < 0 senão `green` |
| `{{lost_rows}}` | Loop nas 10 piores queries |
| `{{impr_rows}}` | Loop nas 8 melhores queries |
| `{{daily_rows}}` | Loop diário com barra de participação |
| `{{q_rows}}` | Top 15 queries do período |
| `{{p_rows}}` | Top 15 páginas do período |
| `{{dev_rows}}` | Breakdown por dispositivo |
| `{{ctry_rows}}` | Top 5 países |
| `{{site_display}}` | Domínio formatado para exibição |

## Regras Fixas

- **Período**: sempre os últimos 7 dias COMPLETOS (ontem até 8 dias atrás)
- **YoY**: mesmo período, 1 ano atrás
- **WoW**: 7 dias imediatamente anteriores ao período atual
- **Queries em queda**: filtrado com >50 cliques em ambos os períodos de 30d
- **Texto**: 100% português do Brasil, zero caracteres de outros idiomas
- **Envio**: sempre enviar via Telegram após gerar
- **Texto dinamico**: TODO o conteúdo do relatório deve ser gerado EXCLUSIVAMENTE a partir dos dados do domínio — nenhuma menção a cidades, projetos ou informações não presentes nos dados extraídos (ex: não mencionar Curitiba, BH, Goiânia, Porto Alegre, SC ou qualquer outra cidade que não seja dado real do domínio)
- **Variáveis dinâmicas obrigatórias**:
  - `{{lost_insight_text}}` — texto gerado dinamicamente com a query de maior drop do domínio
  - `{{impr_insight_text}}` — texto gerado dinamicamente com a query de maior gain do domínio
  - `{{compare_period_label}}` — períodos reais do relatório (não hardcoded)

## Dependências

- `/root/.openclaw/credentials/gog.py` — OAuth2 GSC
- `/root/.openclaw/credentials/google_tokens.json` — token de acesso
- `/root/.openclaw/credentials/gsc_usage.json` — controle de quota
