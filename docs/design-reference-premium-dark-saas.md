# Design Reference — Premium Dark SaaS Aesthetic

_Salvo em: 2026-04-15 |来源: 5 imagens enviadas pelo Osmar_

---

## 🎯 Visão Geral do Estilo

**Keywords:** Premium Dark SaaS, High-Tech AI, Futuristic, Sophisticated, Editorialminimal.
**Domínio:** Dashboards SaaS, Reports, FAQ, Pricing, Meeting Assistants, AI Tools.
**Diferencial:** Atmospheric depth através de camadas de glow, grain e glassmorphism sobre fundo deep dark.

---

## 1. Paleta de Cores

### Backgrounds (Deep Dark Layer)
| Nome | Hex | Uso |
|------|-----|-----|
| Deepest Black | `#05050C` | Background principal (pricing, meeting) |
| Void Navy | `#08080C` | Background text-heavy (FAQ, landing) |
| Deep Navy | `#0A0B1E` | Surface principal |
| Card Surface | `#11111E` | Cards, containers |
| Panel | `#161730` | Janelas, sidebar |
| Glass Surface | `#1A1C2E` | Glassmorphism panels |
| Elevated Surface | `#1E1F42` | Hover states, glassmorphism |

### Acentos (Indigo/Violet Spectrum)
| Nome | Hex | Uso |
|------|-----|-----|
| Primary Action | `#3D37F1` | Botões primários |
| Vibrant Indigo | `#5D5FEF` | Accent principal |
| Soft Lavender | `#8086FF` | Secondary highlights |
| Periwinkle | `#818CF8` | Labels, badges |
| Vibrant Purple | `#5856D6` | Active cards, CTAs |
| Light Lavender | `#A594F9` | Gradient highlights |
| Accent Glow Base | `#1E1B4B` | Deep indigo para glows |
| Glow Mid | `#2D2B52` | Atmospheric glow |

### Texto
| Nome | Hex | Uso |
|------|-----|-----|
| Primary Text | `#FFFFFF` | Títulos, texto principal |
| High Emphasis | `#E5E7EB` | Texto importante |
| Secondary Text | `#9499C3` | Labels, metadata |
| Muted Text | `#94A3B8` | Descrições, body |
| Body Text | `#A1A1B5` | FAQ answers |
| Low Emphasis | `#4B5563` | Placeholder, hints |

### UI Elements
| Nome | Hex | Uso |
|------|-----|-----|
| Border Default | `#2D2D44` | Dividers, bordas sutil |
| Border Bright | `#2E303E` | Hover borders |
| Active Button BG | `#1C1C2E` | Botão ghost/inactive |
| Success Accent | `#4447E2` | Status highlights |
| Popular Badge BG | `#1E293B` | Badge background |

---

## 2. Tipografia

### Font Family Stack
```css
font-family: 'Inter', 'Satoshi', 'Plus Jakarta Sans', 'Manrope', 'Montserrat', sans-serif;
```

**Características:** Geometric sans-serif, clean, highly legible, modern.

### Scale (Approximada)
| Elemento | Tamanho | Weight | Line Height |
|----------|--------|--------|-------------|
| Hero H1 | 36-48px | Semi-bold (600) | 1.1-1.2 |
| Section H2 | 24-28px | Bold (700) | 1.2-1.3 |
| Card Title | 18-20px | Semi-bold (600) | 1.3 |
| Body Large | 15-16px | Regular (400) | 1.5-1.6 |
| Body | 14px | Regular (400) | 1.5 |
| Caption | 12-13px | Medium (500) | 1.4 |
| Micro Label | 11-12px | Bold (700) | 1.0 |
| Mono/Code | 13-14px | JetBrains Mono | 1.5 |

### Special Typography Treatments
- **Labels All Caps:** `letter-spacing: 0.1em to 0.15em`, weight 700, size ~11-12px
- **Hero Text:** `letter-spacing: -0.02em`, tight line-height ~1.1
- **Body Text:** Generous line-height 1.5-1.6 for readability

---

## 3. Background Treatment

### Layering System (bottom to top)
1. **Base solid** — deep dark hex (`#05050C`, `#08080C`, etc.)
2. **Radial gradient** — soft glow from center, lighter in middle
3. **Mesh gradient orbs** — large, blurred, off-center colored circles (purple/indigo)
4. **Noise/grain texture** — film grain overlay, opacity 3-5%

### Grain Texture (CSS/SVG)
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.35;
  z-index: 0;
}
```

### Atmospheric Glows
```css
/* Positioning: top-center ou centro-esquerda */
background: radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0, 212, 255, 0.06), transparent 60%);
background: radial-gradient(ellipse 60% 40% at 80% 100%, rgba(123, 92, 255, 0.08), transparent 55%);
```

---

## 4. Glassmorphism

### Card com Glass Effect
```css
.glass-card {
  background: rgba(30, 31, 66, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}
```

### Parameters
- **Background blur:** 20-30px
- **Border:** 1px solid `rgba(255, 255, 255, 0.05)` — quase invisível
- **Border-radius:** 12-20px
- **Transparency:** 40-70% de opacidade no background

---

## 5. UI Components

### Cards
- **Border-radius:** 12px a 20px
- **Border:** 1px sutil `rgba(255,255,255,0.05)` ou `#2D2D44`
- **Padding:** 20-24px interno
- **Shadow:** Soft drop shadow com blur alto e opacity baixa
- **Hover:** Elevação + borda mais clara

### Botões

**Primário (Solid):**
```css
background: #3D37F1 ou #5D5FEF;
border-radius: 8px;
color: #fff;
padding: 0.5rem 1.25rem;
font-weight: 600;
/* Hover: brilho sutil ou scale */
```

**Ghost/Secondary:**
```css
background: rgba(255,255,255,0.03);
border: 1px solid #2E303E;
border-radius: 8px;
color: #9499C3;
/* Hover: borda mais clara, fundo levemente mais opaco */
```

**Pill-shaped:**
```css
border-radius: 50px; /* Max round */
```

### Status Badges / Labels
```css
/* Pill badge */
display: inline-flex;
align-items: center;
gap: 0.4rem;
background: #1E293B;
border: 1px solid #4F46E5;
color: #818CF8; /* ou accent color */
padding: 0.2rem 0.6rem;
border-radius: 20px;
font-size: 0.7rem;
font-weight: 700;
letter-spacing: 0.1em;
text-transform: uppercase;
```

### Dividers / Lines
```css
height: 1px;
background: #2D2D44; /* ou gradient */
opacity: 0.6;
```

### Icons
- **Style:** Thin-line, stroke width ~1.5-2px
- **Color:** `#9499C3` (inactive), `#FFFFFF` (active)
- **Size:** 16-20px tipicamente

### Stat Boxes / Number Highlights
```css
/* Números grandes em destaque */
font-family: 'Playfair Display', serif; /* ou bold geometric */
font-size: 2.5rem;
font-weight: 700;
background: linear-gradient(135deg, #00d4ff, #7b5cff);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 6. Layout Patterns

### Dashboard Layout
```
┌─────────────────────────────────────────────┐
│ Sidebar (slim, icon-only, ~60px)           │
├──────────────┬──────────────────────────────┤
│              │                              │
│   Hero/      │   Card Grid (bento-box)      │
│   Greeting   │   ─────── ───────           │
│   (H1 +      │   ─────── ───────           │
│   subtitle)  │                              │
│              ├──────────────────────────────┤
│              │   Right Panel (persistent)   │
│              │   Upcoming / Past list       │
└──────────────┴──────────────────────────────┘
```

### Spacing System
- **Outer margin:** 2-4rem em telas grandes
- **Card gap:** 12-16px (grid gutter)
- **Card padding:** 20-24px
- **Section gap:** 2-3rem entre seções
- **Vertical rhythm:** 0.75rem base unit

### Centralized Card Container
- Max-width: 900-960px
- Centralizado com margins automáticos
- Background ligeiramente mais claro que o global
- Border-radius: 12-16px
- Border: 1px sutil

---

## 7. Animation & Motion

### Entrance Animation
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animation-entry {
  animation: fadeUp 0.5s ease-out both;
}
/* Stagger com delay: 0.1s, 0.2s, etc */
```

### Hover Effects
- **Cards:** `transform: translateY(-2px)` + borda mais clara
- **Buttons:** `opacity: 0.9` ou `transform: scale(1.02)`
- **Glow lines:** fade-in de opacity 0 → 1 na base do card

### Micro-interactions
- Status dot com `box-shadow: 0 0 5px [color]` pulsando
- Accordion icon: `+` → `×` rotação suave

---

## 8. FAQ Accordion Pattern

```css
.accordion-item {
  border-bottom: 1px solid #2D2D44;
  padding: 1rem 0;
}
.accordion-item:last-child { border-bottom: none; }
.accordion-question {
  font-size: 18-20px;
  font-weight: 600;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.accordion-answer {
  font-size: 14-15px;
  color: #A1A1B5;
  line-height: 1.6;
  padding-top: 0.75rem;
}
.accordion-icon {
  transition: transform 0.2s;
}
/* Expansible: + → × */
```

---

## 9. Pricing Card Pattern

```css
.pricing-card {
  background: #11111E;
  border: 1px solid #2D2D44;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
}
/* Card ativo/destacado */
.pricing-card.featured {
  background: linear-gradient(135deg, rgba(93,95,239,0.15), rgba(30,27,75,0.3));
  border: 1px solid rgba(93,95,239,0.4);
  box-shadow: 0 0 30px rgba(93,95,239,0.15);
}
/* Popular badge */
.popular-badge {
  background: #1E293B;
  border: 1px solid #4F46E5;
  color: #818CF8;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
```

---

## 10. CSS Variables Template

```css
:root {
  /* Backgrounds */
  --bg-deepest: #05050C;
  --bg-deep: #08080C;
  --bg-surface: #0A0B1E;
  --bg-card: #11111E;
  --bg-panel: #161730;
  --bg-glass: rgba(30, 31, 66, 0.6);

  /* Borders */
  --border: #2D2D44;
  --border-bright: #2E303E;
  --border-glass: rgba(255, 255, 255, 0.05);

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #9499C3;
  --text-muted: #4B5563;

  /* Accents */
  --accent-primary: #3D37F1;
  --accent-indigo: #5D5FEF;
  --accent-lavender: #A594F9;
  --accent-violet: #818CF8;
  --accent-cyan: #00d4ff;

  /* Glows */
  --glow-indigo: rgba(93, 95, 239, 0.15);
  --glow-violet: rgba(123, 92, 255, 0.08);
  --glow-cyan: rgba(0, 212, 255, 0.06);

  /* Typography */
  --font-sans: 'Inter', 'Satoshi', 'Plus Jakarta Sans', 'Manrope', sans-serif;
  --font-display: 'Playfair Display', serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 50px;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 30px var(--glow-indigo);
}
```

---

## 11. Notes de Implementação

### Fonts a Usar (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Fontes Alternativas (fallback chain)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
/* Display: 'Playfair Display', Georgia, serif; */
/* Mono: 'JetBrains Mono', 'Fira Code', monospace; */
```

### Accessibility
- Contraste mínimo 4.5:1 para texto secundário
- `--text-secondary: #9499C3` é o limite inferior aceptável
- Para texto menor, manter mais próximo de `#FFFFFF`

---

_Extraído por Clara — 2026-04-15 — 5 imagens analisadas_
