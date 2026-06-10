# memory/projects/santtas.md — Santtas

---

## metadata

| Campo | Valor |
|-------|-------|
| Nome | Santtas |
| Tipo | Site de anúncios para acompanhantes de luxo |
| Domínio | br.santtas.com |
| URL base | https://br.santtas.com/acompanhantes/{uf}/{cidade} |
| Stack | Laravel (versão atual + nova versão) |
| Responsável | Osmar (só ele) + Victor Lima (dev Laravel) |
| Versão | Atual (legacy) + Nova (lançamento 01/05/2026) |
| Status | ativo (legacy) |
| Início | anterior a 2022 |
| GA Property ID | 309196085 |
| GA Measurement ID | G-MPRZ7ZTT48 |
| Última atualização | 2026-04-15 |


---

## Infraestrutura (2026-04-20)

| Campo | Valor |
|-------|-------|
| Gestor | Daniel P. Kruger |
| Telefone | 48999284269 |
| Empresa | Kruger Tech |
| Domínio | https://www.krugertech.com.br/ |
| Status | Ativo |

## Nova Versão (lançamento 01/05/2026)

| Campo | Valor |
|-------|-------|
| Framework | Laravel |
| Sistema de pagamento | Safe2Pay |
| Desenvolvedor | Victor Lima (Laravel specialist) |
| Servidor | Dedicado EVEO SP1 (#2508) |
| CPUs | 2x Intel Xeon 2699v3 (36c/72t, turbo 3.6GHz) |
| RAM | 128GB |
| Storage | 2x 240GB SSD (RAID 1) + 2x 2TB NVMe |
| Rede | 1Gbps ilimitado + 5 IPs |

---

## O que é o Santtas

**Modelo de negócio:** Site de classificados para acompanhantes de luxo (escorts). Anunciantes criam perfis com fotos, informações, cidade. Usuários buscam por cidade para encontrar e contatar através do site.

**Estrutura de páginas:**
- Landing pages por cidade: `/acompanhantes/{uf}/{cidade}` — ex: `/acompanhantes/pr/londrina`
- Área logada (`/user/dashboard`) — para anuciantes gerenciarem seus perfis
- Homepage (`/home`)

**Fontes de receita prováveis:** Anúncios premium de acompanhantes, destaque de perfis.

---

## Dados de Tráfego — Google Search Console (15 Jan - 14 Abr 2026)

| Métrica | Valor | Observação |
|---------|-------|-----------|
| Total de cliques | ~5.16M | ~58k/dia |
| Total de impressões | ~59.7M | ~670k/dia |
| CTR médio | 8.64% | acima da média do nicho |
| Posição média | ~6.1 | competitivo |

---

## Dados de Tráfego — Google Analytics (15 Mar - 14 Abr 2026)

### Totais

| Métrica | Valor | Observação |
|---------|-------|-----------|
| Sessões | **1.67M** | 53k/dia |
| Usuários únicos | **1.43M** | 545k recorrentes, 888k novos |
| Pageviews | **12.05M** | 7.2 por sessão |
| Bounce rate | **24.7%** | baixo = muito engajado |
| Taxa de engajamento | **75.3%** | alto = boa qualidade |
| Duração média | **222s** (~3.7min) | above average |
| Novos usuários | **62%** | 888k de 1.43M |
| Sessões por usuário | **1.16** | usuários recorrentes |

### Tráfego por Canal

| Canal | Sessões | % | Bounce | Engajamento |
|-------|---------|---|--------|-------------|
| Organic Search | 1.509M | **93.4%** | 22.8% | 77.2% |
| Direct | 98.5k | 6.1% | 34.8% | 65.2% |
| Referral | 1.6k | 0.1% | 29.7% | 70.3% |
| Organic Social | 417 | 0.0% | 48.9% | 51.1% |

**93.4% do tráfego vem do Google orgânico.** Marca estabelecida com forte presença de busca.

### Tráfego por Fonte

| Fonte | Sessões | Observação |
|-------|---------|-----------|
| google | 1.50M | Principal |
| (direct) | 98.5k | Bookmarks/branding direto |
| bing | 4.0k | Busca Bing/Bing AI |
| br.search.yahoo.com | 1.7k | Busca Yahoo |
| duckduckgo | 1.1k | Busca DuckDuckGo |

### Tráfego por Dispositivo

| Dispositivo | Sessões | % | Bounce | Duração |
|-------------|---------|---|--------|---------|
| **Mobile** | 1.54M | **95.0%** | 24.6% | 223s |
| Desktop | 76.9k | 4.7% | 15.3% | 319s |
| Tablet | 4.9k | 0.3% | 21.7% | 213s |
| Smart TV | 132 | 0.0% | 18.9% | 387s |

**Mobile domina com 95%.** Usuários buscam em movimento. UX mobile é absolutamente crítica.

### Tráfego por País

| País | Sessões | Usuários | Bounce |
|------|---------|---------|--------|
| 🇧🇷 Brasil | 1.585M | 1.017M | 23.4% |
| 🇺🇾 Uruguai | 10.3k | 4.7k | 14.0% |
| 🇺🇸 EUA | 2.7k | 2.2k | 26.1% |
| 🇦🇷 Argentina | 1.4k | 1.1k | 26.8% |

**99%+ do tráfego é brasileiro.**

### Tráfego por Dia da Semana

| Dia | Sessões | Observação |
|-----|---------|-----------|
| Segunda | 303k | **Mais alto** |
| Terça | 278k | Alto |
| Quarta | 219k | Médio |
| Domingo | 231k | Alto |
| Quinta | 214k | Médio |
| Sexta | 207k | Médio-baixo |
| **Sábado** | 197k | **Mais baixo** |

**Padrão diferenciado:** fim de semana cai menos que o esperado (comparado a outros nichos). Usuários buscam acompanhantes de forma consistente durante a semana toda.

### Tendência Mensal

| Mês | Sessões | Usuários | Novos | Bounce |
|-----|---------|---------|-------|--------|
| Mar 2026 | 923k | 598k | 489k | 24.2% |
| Abr 2026 | 748k | 497k | 398k | 26.9% |

**Queda de ~19% em Abril** — pode ser sazonalidade (Páscoa/férias?) ou queda sazonal do nicho.

---

## Top 20 Cidades (por sessões)

| Cidade | UF | Sessões | Pageviews | Obs |
|--------|----|---------|-----------|-----|
| Londrina | PR | 30.8k | 233k | Líder isolado |
| Manaus | AM | 26.0k | 135k | Alto volume |
| Joinville | SC | 21.6k | 138k | |
| Erechim | RS | 20.3k | 127k | |
| Salvador | BA | 19.9k | 112k | |
| Caxias do Sul | RS | 19.3k | 147k | Alto PV/sessão |
| Fortaleza | CE | 18.9k | 92k | |
| Porto Alegre | RS | 17.5k | 104k | |
| Belém | PA | 17.3k | 98k | |
| Ponta Grossa | PR | 15.2k | 78k | |
| Belo Horizonte | MG | 13.9k | 64k | |
| São Luís | MA | 12.9k | 58k | |
| Teresina | PI | 12.8k | 50k | |
| Maringá | PR | 12.8k | 61k | |
| Gov. Valadares | MG | 12.4k | 70k | |
| Blumenau | SC | 12.3k | 71k | |
| Passo Fundo | RS | 12.1k | 107k | Alto PV/sessão |
| Macapá | AP | 11.3k | 58k | |
| Santa Maria | RS | 10.9k | 49k | |
| Florianópolis | SC | 10.9k | 63k | |

**Observação:** Caxias do Sul e Passo Fundo têm alto pageviews/sessão (~7.6) vs média de 7.2 — usuários navegam mais nestas páginas.

---

## Estrutura de Páginas (top pages)

| Página | Tipo | Observação |
|--------|------|-----------|
| /home | Homepage | 81k sessões |
| /acompanhantes/pr/londrina | Landing cidade | 56k sessões |
| /user/dashboard | Área logada | 51k sessões — anuciantes gerenciam |
| /acompanhantes/rs/erechim | Landing cidade | 38k sessões |
| /acompanhantes/rs/caxias-do-sul | Landing cidade | 35k sessões |

**Presença da /user/dashboard no top 5** = existe área de anuciantes logados. Plataforma tem sistema de contas.

---

## Insights SEO (comparando GSC + GA)

1. **Cidades pequenas = CTR e posição melhores** — Erechim (CTR 38.5%, pos 1.6), Santa Maria, Ponta Grossa. Menor concorrência.
2. **Cidades grandes perdem em CTR** — BH (CTR 4.1%, pos 8.2), Fortaleza (CTR 4.9%, pos 7.1). Alta concorrência mas volume alto.
3. **GSC cliques ~5.16M vs GA sessões ~1.67M** — GSC conta cliques em resultados de busca; GA conta sessões no site. Usuários podem clicar mas não criar sessão (páginas carregam rápido, bot).
4. **Desktop tem bounce 34.8%** vs **mobile 24.6%** — desktop pode ter mais cliques acidentais ou bots.
5. **93.4% orgânico** = não depende de anúncios pagos. Tráfego orgânico gratuito e massivo.

---

## Oportunidades de Crescimento

### 🔴 Alta Prioridade
| Oportunidade | Cidade | Situação atual | Potencial |
|-------------|--------|---------------|----------|
| Otimizar meta tags | Belo Horizonte (CTR 4.1%) | 13.9k sessões, pos 8.2 | Dobrar cliques com meta descritiva |
| Otimizar meta tags | Fortaleza (CTR 4.9%) | 18.9k sessões, pos 7.1 | Meta tags + schema local |
| Otimizar meta tags | Porto Alegre (CTR ~5%) | 17.5k sessões, pos 7.8 | Meta tags + autoridade local |
| Schema markup LocalBusiness | Todas cidades | Sem markup provável | Ganhar rich snippets |

### 🟡 Média Prioridade
| Oportunidade | Situação | Potencial |
|-------------|---------|-----------|
| Novas cidades | Campinas não tem página | Palavra-chave genérica forte |
| Brasília/DF | Não coberta | Capital, alto volume |
| Curitiba | Página não existe | Capital PR, mercado enorme |
| Goiânia | Não coberta | Mercado grande |

### 🟢 quick wins
- **Texto âncora interno** — Links entre cidades com nomes de estado
- **FAQ schema** — Perguntas frequentes sobre a cidade
- **Reviews/testimonials** — Seção de "depoimentos" pode aumentar CTR

---

## Dados para Benchmarking

| Métrica | Valor Santtas | Média do nicho |
|---------|--------------|---------------|
| CTR médio GSC | 8.64% | ~3-5% |
| Posição média | 6.1 | ~8-12 |
| Bounce rate GA | 24.7% | ~40-60% |
| Engajamento | 75.3% | ~50-60% |
| Pages/sessão | 7.2 | ~3-4 |

**O Santtas está Acima da Média do Nicho em Todos os Indicadores.** Boa saúde de SEO.

---

## Gostaria de Aprofundar

- [ ] Páginas de cidade específicas (meta tags, conteúdo)
- [ ] Análise de concorrentes de SEO (outros sites de acompanhantes)
- [ ] Potencial de expansão para novas cidades
- [ ] Análise de ROI de campanhas (se houver)

---

_Last updated: 2026-04-15_

---

## Backblaze Backup (2026-04-20)

- **Serviço:** Backblaze (B2 Cloud Storage)
- **Email:** santtas@santtas.com
- **Status:** Decisão tomada — a implementar
- **Valores:** Pendente — Osmar ainda precisa obter os valores corretos
- **Próximo passo:** Obter credenciais de acesso e valores da assinatura
