# SerproBot API — Guia de Interpretação

**Fonte:** `https://api.serprobot.com/v1/api.php`
**Project ID define o projeto:** `project_id` na URL determina qual projeto é consultado.
- `project_id=1262084` = Santtas
- Outros IDs = outros projetos (ainda não mapeados)
**Autenticação:** `api_key=d84693ef60e0fd23fe6b2c675f9b6bc1`

---

## Campos e Interpretação

| Campo | Significado |
|---|---|
| `keyword_id` | ID único da keyword no SerproBot |
| `keyword` | Termo pesquisado |
| `change` | Variação vs atualização anterior do SerproBot |
| `earliest_position` | Posição mais alta (pior rank) no período |
| `latest_position` | Posição mais recente no período |
| `best_ever_position` | Melhor posição já registrada (número mais baixo) desde que a keyword é monitorada |
| `first_ever_position` | null = keyword recém-adicionada (não estava no top 100) |
| `found_serp` | URL da página que está rankeando |
| `volume_global` | Volume de busca global (N/A = não disponível) |
| `volume_local` | Volume de busca local (N/A = não disponível) |
| `cpc_global` / `cpc_local` | Custo por clique (em BRL) |
| `updated` | Data/hora da última atualização |

---

## Regras de Interpretação do change

| Valor de change | Significado |
|---|---|
| **negativo (ex: −17)** | Keyword **melhorou** no ranking (subiu posições) |
| **positivo (ex: +8)** | Keyword **perdeu** posições no ranking (caiu) |
| **change: null** | Sem histórico comparativo ainda |
| **change: 0** | Sem alteração vs período anterior |

⚠️ **Importante:** no SerproBot, `change` usa a lógica de "delta de posição" — números negativos significam melhora porque a posição numérica caiu (rank 5 → rank 3 = −2 = melhorou 2 posições).

---

## Notas sobre volume e dados

- `volume_global: "-"` ou `volume_local: "-"` → dado não disponível no momento da verificação
- `first_ever_position: null` → keyword recém-adicionada ao SerproBot, não estava no top 100 no histórico

---

## Endpoint Principal

```
action=project_report&project_id=1262084
```

Período default: últimos 30 dias (21/mar–20/abr para este projeto).

---

## Estrutura de dados

```json
{
  "id": 1262084,
  "start": "2026-03-21",
  "end": "2026-04-20",
  "report_data": [
    {
      "keyword_id": 43070527,
      "keyword": "Acompanhantes Anápolis",
      "change": -17,
      "earliest_position": 30,
      "latest_position": 13,
      "best_ever_position": 13,
      "found_serp": "https://br.santtas.com/acompanhantes/go/anapolis",
      "volume_global": "-",
      "volume_local": "-",
      "updated": "2026-04-18 14:54:28"
    }
  ]
}
```
