# SEO Keyword Report Template — Design Standard

_Criado: 2026-04-15 | Atualizado: 2026-04-15 | Baseado em: Premium Dark SaaS Aesthetic_

---

## Quando Usar

Solicitado um novo **SEO Keyword Research Report** via `seo-keyword-researcher` + `web-browsing`.

**Arquivo base:** `reports/seo-keyword-research-template.html`
**Design reference:** `docs/design-reference-premium-dark-saas.md`

---

## Design System — Premiun Dark SaaS (Fixed)

### Paleta de Cores
```css
--bg-deepest: #05050C;      /* Background principal */
--bg-deep: #08080C;          /* Text-heavy sections */
--bg-surface: #0A0B1E;       /* Surface principal */
--bg-card: #11111E;           /* Cards e containers */

--border: #2D2D44;           /* Bordas sutis */
--border-bright: #3D3D5C;    /* Hover borders */

--text-primary: #FFFFFF;       /* Títulos */
--text-secondary: #9499C3;   /* Labels, metadata */
--text-body: #A1A1B5;        /* Body text */
--text-muted: #4B5563;       /* Placeholder */

--accent-indigo: #5D5FEF;     /* Accent principal */
--accent-violet: #818CF8;    /* Secondary accent */
--accent-lavender: #8086FF;  /* Highlights */
--accent-cyan: #00d4ff;       /* Status cyan */
--accent-green: #00E57A;     /* Status green */
```

### Tipografia
- **Display:** Playfair Display (Google Fonts)
- **Sans:** Inter (Google Fonts)
- **Mono:** JetBrains Mono (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Background Treatment
```css
body::before {
  background:
    radial-gradient(ellipse 90% 60% at 10% -5%, rgba(93, 95, 239, 0.12) 0%, transparent 55%),
    radial-gradient(ellipse 70% 50% at 90% 105%, rgba(123, 92, 255, 0.1) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0, 212, 255, 0.04) 0%, transparent 65%),
    linear-gradient(180deg, #080818 0%, #050510 100%);
}

body::after {
  /* Noise grain SVG */
  opacity: 0.035;
}
```

### Componentes Padrão

**Card:**
```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: 16px;
padding: 1.5rem;
margin: 1rem 0;
transition: all 0.25s;
```

**Stat Box:**
```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: 16px;
padding: 1.75rem 1.25rem;
text-align: center;
/* Hover: translateY(-2px) + glow line */
```

**Keyword Tag:**
```css
background: rgba(255,255,255,0.03);
border: 1px solid var(--border);
border-radius: 50px;
padding: 0.3rem 0.8rem;
font-size: 0.8rem;
/* Variantes: cyan, violet, green */
```

**Status Dot:**
```css
/* green: box-shadow: 0 0 6px var(--accent-green); */
/* yellow: box-shadow: 0 0 6px rgba(255, 184, 0, 0.5); */
/* orange: box-shadow: 0 0 6px rgba(255, 124, 58, 0.5); */
```

**Section Divider:**
```css
height: 1px;
background: linear-gradient(90deg, var(--border), transparent);
margin: 2.5rem 0;
```

**Animations:**
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Stagger: 0s, 0.05s, 0.08s, 0.1s */
```

### Estrutura do Report

1. **Header** — label + H1 + subtitle + meta items
2. **Stat Grid** — 3 columns, números grandes com gradient
3. **Data Cards** — salary table + cronograma table
4. **Callout** — contexto com borda colorida
5. **Section Divider**
6. **Keyword Cluster** — primary card + secondary/h questions/long-tails clouds
7. **Section Divider**
8. **Competitor Analysis** — card com table
9. **Callout** — gap principal
10. **Section Divider**
11. **Article Brief** — brief-boxes (title, meta, structure list, word count, SEO recs)
12. **Section Divider**
13. **Content Calendar** — card com table de timing
14. **Callout warning** — velocidade é crucial
15. **Section Divider**
16. **Keyword Map** — card com table
17. **Sources** — source cloud
18. **Footer** — info + botão imprimir

---

## Checklist de Geração

- [ ] Criar arquivo: `reports/[keyword-slug]-keyword-research.html`
- [ ] Copiar estrutura HTML base deste template
- [ ] Aplicar CSS variables conforme palette acima
- [ ] Inserir dados reais do SERP (buscados via web_fetch)
- [ ] Gerar keyword cluster completo (primary + secondary + questions + long-tails)
- [ ] Preencher article brief com H1, meta, 10 H2s, word count, SEO recs
- [ ] Preencher competitor analysis com gaps reais
- [ ] Criar content calendar com timing por fase
- [ ] Adicionar fontes no footer
- [ ] Enviar via Telegram como media

---

## Notas

- **Animações:** usar fadeUp staggered — nenhuma outra animação necessária
- **Hover states:** todos os cards + keywords devem ter hover
- **Status dots:** usar glow real com box-shadow (não emoji)
- **Glow lines:** stat boxes ganham glow line on hover
- **Fonts:** Inter = body, Playfair Display = títulos e números, JetBrains Mono = labels e código

---

_Standard salvo por Clara — 2026-04-15_
