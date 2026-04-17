# SEO Reports — Glossário de Métricas

## Tráfego Mensal

### Cliques
**O que é:** Número de vezes que usuários clicaram no seu site nos resultados do Google.
**Fonte:** Google Search Console.
**Atualização:** Quando novo CSV de tráfego diário é importado.

### Impressões
**O que é:** Número de vezes que seu site apareceu nos resultados do Google para uma consulta.
**Fonte:** Google Search Console.
**Atualização:** Mesmo CSV dos cliques.

### CTR (Click-Through Rate)
**O que é:** `Cliques / Impressões × 100`. Percentual do público que viu seu site e clicou.
**Como usar:** CTR alto = título e meta description atrativos para aquela posição. CTR baixo com posição alta = melhorar snippet.

### Posição Média
**O que é:** Posição média ponderada do seu site para todas as consultas no período. Quanto menor, melhor.
**Fonte:** Google Search Console.
**Atualização:** Mesmo CSV dos cliques.

### vs Mês Ant.
**O que é:** Variação percentual em relação ao mês anterior.
- 🟢 Verde (subiu) = melhor que o mês anterior
- 🟡 Amarelo (caiu) = pior que o mês anterior
**Como interpretar:** `+15%` significa 15% mais cliques que o mês anterior.

---

## Queries (Consultas)

### O que são
**O que é:** As buscas específicas (palavras/frases) que mais geraram cliques para o site no período.
**Fonte:** CSV de Queries do Google Search Console.
**Filtro:** O período selecionado no bloco de Queries.

---

## Páginas

### O que são
**O que é:** As URLs do seu site que mais receberam cliques no período.
**Fonte:** CSV de Páginas do Google Search Console.
**Filtro:** O período selecionado no bloco de Páginas.

---

## Keywords

### Posição Inicial
**O que é:** Posição no ranking no momento em que a keyword foi cadastrada no sistema.
**Como cadastrar:** Ao criar uma keyword, informe a posição atual e o mês de referência.
**Uso:** Ponto de partida para medir evolução.

### Melhor (hist.)
**O que é:** A menor posição já atingida pela keyword desde o cadastro — não é resetada.
**Como atualizar:** Adicione novas posições mensais para o histórico crescer.
**Interpretação:** Mostra o melhor resultado já alcançado, independente de quando foi.

### Recente
**O que é:** O último dado disponível dentro do período selecionado acima.
**Como atualizar:** Adicione novas posições mensais.

### Evolução (Δ)
**O que é:** Diferença entre a posição Recente e a Inicial.
- 🟢 Positivo (ex: `+3`) = subiu no ranking
- 🟡 Negativo (ex: `-5`) = caiu no ranking

---

## Como adicionar dados

### Tráfego, Queries, Páginas
1. Vá em `/clients/[id]/import`
2. Selecione o tipo de CSV (Tráfego Diário / Queries / Páginas)
3. Defina o período (início e fim)
4. Faça upload do CSV exportado do Google Search Console
5. Os dados ficam disponíveis no relatório imediatamente

### Keywords
1. Vá em `/clients/[id]` — seção **Keywords**
2. Clique em **Nova Keyword**
3. Preencha: keyword, posição inicial, mês de referência
4. Para tracked monthly: clique em **Adicionar posição do mês**

---

_Last updated: 2026-04-17_
