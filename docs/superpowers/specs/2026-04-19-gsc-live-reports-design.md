# GSC Live Reports — Design

**Data:** 2026-04-19
**Status:** Aprovado
**Tipo:** Feature de integração

---

## Objetivo

Substituir os dados CSV importados manualmente por dados live da Google Search Console (GSC) via OAuth2 direta. Relatórios puxam dados em tempo real, sem dependência de Composio.

---

## Arquitetura

### Stack
- **OAuth2 direto** (`gog.py`) — sem Composio
- **Google Search Console API** (`/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`)
- **Arquivo de tracking** (`gsc_usage.json`) — contador de requisições por dia
- **DB Mission Control** — campo `gsc_property_url` na tabela `clients`

### Arquivos novos
```
mission-control/src/app/api/clients/[id]/gsc/route.ts    ← API route GSC live
mission-control/src/components/ui/GscUsageBadge.tsx       ← Badge de uso da API
mission-control/src/components/ui/GscBadge.tsx            ← Ícone/nome "Google Search Console"
credentials/gog.py                                        ← existente, expandir
credentials/gsc_usage.json                               ← tracking de uso
```

### Arquivos alterados
```
mission-control/src/lib/seo-db.ts           ← adicionar gsc_property_url na clients
mission-control/src/app/(dashboard)/clients/page.tsx                          ← formulário com novo campo
mission-control/src/app/(dashboard)/clients/[id]/reports/page.tsx            ← dados live GSC
```

---

## Campo gsc_property_url

**Tabela:** `clients`
**Tipo:** `TEXT` (nullable)
**Label no modal:** "Google Search Console Property URL"
**Hint:** "Cole a URL da propriedade GSC (ex: sc-domain:dominio.com ou https://www.dominio.com)"

---

## API Route — GET /api/clients/[id]/gsc

**Parâmetros (query):**
| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `type` | `monthly` \| `queries` \| `pages` | `monthly` | Tipo de dado |
| `from` | `YYYY-MM-DD` | 90 dias atrás | Data início |
| `to` | `YYYY-MM-DD` | hoje | Data fim |
| `limit` | número | 1000 | Limite de rows |

**Resposta (type=monthly):**
```json
{
  "rows": [{ "month": "2026-03", "clicks": 1867119, "impressions": 21121882, "ctr": 8.84, "position": 6.09 }],
  "totals": { "clicks": 1867119, "impressions": 21121882 },
  "lastUpdated": "2026-04-19T14:50:00Z",
  "requestsToday": 12
}
```

**Resposta (type=queries):**
```json
{
  "rows": [{ "query": "acompanhantes florianopolis", "clicks": 1234, "impressions": 9876, "ctr": 12.5, "position": 3 }],
  "lastUpdated": "...",
  "requestsToday": 13
}
```

**Resposta (type=pages):**
```json
{
  "rows": [{ "pageUrl": "https://br.santtas.com/acompanhantes", "clicks": 5678, "impressions": 45678, "ctr": 12.4, "position": 5 }],
  "lastUpdated": "...",
  "requestsToday": 14
}
```

**Erros:**
- `403` — OAuth sem permissão na propriedade → mostrar "Configure acesso GSC"
- `404` — propriedade não existe → mostrar "Propriedade não encontrada"
- `401` — token expirado → acionar refresh automático

---

## GSC Usage Tracking

**Arquivo:** `/root/.openclaw/credentials/gsc_usage.json`

```json
{
  "2026-04-19": {
    "requests": 14,
    "lastReset": "2026-04-19T00:00:00Z"
  }
}
```

**Lógica:**
1. Antes de cada requisição GSC, leio o arquivo
2. Se é dia novo, zero o contador
3. Incremento +1
4. Gravo de volta
5. Retorno `requestsToday` na resposta da API

---

## Componentes UI

### GscBadge
Ícone/nome "Google Search Console" com cor Google — usado em cada bloco.

```tsx
<span class="flex items-center gap-1 text-xs text-[var(--text-muted)]">
  <GoogleIcon /> Google Search Console
</span>
```

### GscUsageBadge
Badge de uso da API.

```
⏱ Atualizado há 5 min • 14 requisições hoje
```

**Formato:** `⏱ Atualizado há {tempo} • {n} requisições hoje`

Se `requestsToday > 8000`: badge em amarelo com warning de quota.

---

## Seções do Report (blocos)

Cada bloco GSC tem:
1. **Header** com título + GscBadge + filtro de período (date inputs "De" / "Até")
2. **GscUsageBadge** (footer)
3. **Loading state** com skeleton
4. **Empty state** se sem dados

### 1. Tráfego Mensal
Mesma estrutura atual (KPI cards + tabela de meses), mas populado via GSC:
- Colunas: Mês | Cliques | vs Mês Ant. | Impressões | vs Mês Ant. | CTR | vs Mês Ant. | Posição | vs Mês Ant.
- Dados vindos de `type=monthly` (agregação `byProperty`)

### 2. Queries Top
Mesma estrutura atual, populado via GSC:
- Colunas: Query | Cliques | Impressões | CTR | Posição
- Limit: top 20 por cliques no período
- Dados vindos de `type=queries`

### 3. Páginas Top
Mesma estrutura atual, populado via GSC:
- Colunas: URL | Cliques | Impressões | CTR | Posição
- Limit: top 20 por cliques no período
- Dados vindos de `type=pages`

### 4. Keywords (mantido)
Seção existente via DB — keywords cadastradas manualmente. **Não muda.**

---

## Fluxo de Dados

```
[Report Page] → GET /api/clients/[id]/gsc?type=monthly&from=...&to=...
     ↓
[API Route] → busca client.gsc_property_url no DB
     ↓
[GSC API] → POST searchAnalytics/query via gog.py
     ↓
[gog.py] → incrementa gsc_usage.json → retorna dados
     ↓
[Report Page] → renderiza com GscBadge + GscUsageBadge
```

---

## Autenticação OAuth

**Script:** `/root/.openclaw/credentials/gog.py` (existente)

**Scopes necessários:**
- `https://www.googleapis.com/auth/webmasters.readonly`

**Flux de refresh:**
- `get_access_token()` verifica `token_expiry` (timestamp)
- Se expirado, chama `refresh_access_token()` automaticamente
- Access token renovado salvo no `google_tokens.json`

---

## Rate Limits e Performance

| Métrica | Valor |
|---------|-------|
| Limite GSC | ~10.000 req/dia por propriedade |
| Timeout por requisição | 15 segundos |
| Cache no browser | nenhum (dados sempre live) |
| Retry em falha | 1 retry com backoff de 2s |

**Proteção anti-quota:**
- Badge muda para amarelo quando `requestsToday > 8000`
- Se `requestsToday >= 9500`, desabilitar auto-refresh e mostrar warning

---

## Estados de Erro

| Situação | Mensagem no bloco |
|----------|------------------|
| Sem `gsc_property_url` | "Configure a propriedade GSC nas configurações do cliente" |
| Token expirado | "Sessão Google expirou. Reautorize em Configurações." |
| 404 propriedade | "Propriedade GSC não encontrada. Verifique a URL." |
| 403 sem permissão | "Sem acesso a esta propriedade GSC. Conceda acesso ao email da projeto." |
| Erro genérico | "Erro ao carregar dados GSC. Tente novamente." |

---

## Checklist de Implementação

- [ ] Adicionar `gsc_property_url TEXT` na tabela `clients`
- [ ] Atualizar `getClient` / `updateClient` no seo-db.ts
- [ ] Atualizar formulário de criação/edição (modal) com novo campo
- [ ] Expandir `gog.py` com função `gsc_usage_increment()`
- [ ] Criar API route `GET /api/clients/[id]/gsc`
- [ ] Criar componentes `GscBadge` e `GscUsageBadge`
- [ ] Substituir seções do report page por dados live GSC
- [ ] Adicionar estados de erro em cada bloco
- [ ] Testar com Santtas (gsc_property_url已知)
