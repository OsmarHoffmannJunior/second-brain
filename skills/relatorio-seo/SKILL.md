---
name: relatorio-seo
description: Gerador automático de relatório SEO do Google Search Console. Usa os dados do GSC para gerar um relatório completo com KPIs, comparativos de período, consultas que perderam/melhoraram posição, top páginas, top consultas, dispositivo e país. Salva em /root/.openclaw/workspace/mission-control/reports/ e envia pelo Telegram.
---

# Relatório SEO — Skill de Relatório do Google Search Console

## Quando Usar

- `"GSC br.santtas.com"`
- `"GSC sc-domain:br.santtas.com"`
- `"gera relatório do santtas"`
- `"relatório seo"`
- `"relatório GSC"`
- Qualquer variação que mencione GSC + relatório + domínio

## Fluxo de Execução

### Passo 1 — Identificar o domínio GSC

Se o domínio não for informado explicitamente, usar o padrão:
- `sc-domain:br.santtas.com` para Santtas

### Passo 2 — Buscar dados (script Python)

```bash
python3 /root/.openclaw/workspace/skills/relatorio-seo/scripts/gerar_relatorio.py <gsc_site_url> [output_dir]
```

Exemplo:
```bash
python3 /root/.openclaw/workspace/skills/relatorio-seo/scripts/gerar_relatorio.py sc-domain:br.santtas.com
```

O script:
1. Busca dados do GSC via OAuth2 (gog.py)
2. Calcula comparativos do período atual vs período anterior e YoY
3. Compara posição de consultas (últimos 30 dias vs 30-60 dias)
4. Salva os dados em `/tmp/gsc_data.json`

### Passo 3 — Preencher template HTML

Ler `/tmp/gsc_data.json` e o template em:
`/root/.openclaw/workspace/skills/relatorio-seo/assets/template.html`

Preencher todas as variáveis `{{...}}` com os dados do JSON.

### Passo 4 — Salvar e Enviar

1. Salvar HTML em `/root/.openclaw/workspace/mission-control/reports/seo-report-{data}.html`
2. Enviar via Telegram com caption resumindo os números principais

## Estrutura de Arquivos

```
relatorio-seo/
├── SKILL.md                          ← este arquivo
├── scripts/
│   └── gerar_relatorio.py            ← busca dados GSC e salva JSON
└── assets/
    └── template.html                 ← template HTML do relatório
```

## Variáveis do Template

| Variável | Fonte |
|---|---|
| `{{period_label}}` | `from_dt.strftime('%d') – to_dt.strftime('%d %b %Y')` |
| `{{from_to_str}}` | Período atual formatado |
| `{{yoy_period}}` | Período YoY |
| `{{prev_period}}` | Período comparativo anterior |
| `{{compare_period_label}}` | **Dinâmico** — períodos reais do relatório (não hardcoded) |
| `{{yoy_pct}}` | `((curr.clicks/yoy.clicks)-1)*100` → `+X.X%` |
| `{{wow_pct}}` | `((curr.clicks/prev.clicks)-1)*100` → `+X.X%` |
| `{{wow_color}}` | `red` se wow_change < 0 senão `green` |
| `{{lost_rows}}` | Loop nas 10 piores consultas |
| `{{impr_rows}}` | Loop nas 8 melhores consultas |
| `{{daily_rows}}` | Loop diário com barra de participação |
| `{{q_rows}}` | Top 15 consultas do período |
| `{{p_rows}}` | Top 15 páginas do período |
| `{{dev_rows}}` | Breakdown por dispositivo |
| `{{ctry_rows}}` | Top 5 países |
| `{{site_display}}` | Domínio formatado para exibição |
| `{{lost_insight_text}}` | **Dinâmico** — consulta de maior drop do domínio |
| `{{impr_insight_text}}` | **Dinâmico** — consulta de maior gain do domínio |
| `{{yoy_insight_block}}` | **Dinâmico** — texto YoY baseado nos dados reais |
| `{{wow_insight}}` | **Dinâmico** — texto WoW baseado nos dados reais |
| `{{lost_count}}` | Contagem real de consultas em queda |
| `{{impr_count}}` | Contagem real de consultas em alta |

## Regras Fixas

- **Texto**: 100% português do Brasil
- **Envio**: sempre enviar via Telegram após gerar
- **Regra crítica — dados 100% dinâmicos por domínio**: TODO o conteúdo do relatório deve ser gerado EXCLUSIVAMENTE a partir dos dados reais do GSC do domínio solicitado. Apenas informações presentes nos dados extraídos desse projeto específico podem ser incluídas — nenhuma herança de dados de outros projetos. **Exemplos proibidos**: não incluir informações de Curitiba, BH, Goiânia, Porto Alegre, SC, Santtas, MGM ou qualquer outro projeto que não seja o domínio do relatório.

## Dependências

- `/root/.openclaw/credentials/gog.py` — OAuth2 GSC
- `/root/.openclaw/credentials/google_tokens.json` — token de acesso
- `/root/.openclaw/credentials/gsc_usage.json` — controle de quota
