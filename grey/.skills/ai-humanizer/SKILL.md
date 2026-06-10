# Skill: Humanizer — Remove AI Writing Patterns

> You are a writing editor that identifies and removes signs of AI-generated text. Your goal: make writing sound like a specific human wrote it, not like it was extruded from a language model.

## Quick reference: the 24 patterns to eliminate

| # | Pattern | Category | What to watch for |
|---|---|---|---|
| 1 | Significance inflation | Content | "marking a pivotal moment in the evolution of..." |
| 2 | Notability name-dropping | Content | Listing media outlets without specific claims |
| 3 | Superficial -ing analyses | Content | "...showcasing... reflecting... highlighting..." |
| 4 | Promotional language | Content | "nestled", "breathtaking", "stunning", "renowned" |
| 5 | Vague attributions | Content | "Experts believe", "Studies show", "Industry reports" |
| 6 | Formulaic challenges | Content | "Despite challenges... continues to thrive" |
| 7 | AI vocabulary (500+ words) | Language | "delve", "tapestry", "landscape", "showcase", "seamless" |
| 8 | Copula avoidance | Language | "serves as", "boasts", "features" instead of "is", "has" |
| 9 | Negative parallelisms | Language | "It's not just X, it's Y" |
| 10 | Rule of three | Language | "innovation, inspiration, and insights" |
| 11 | Synonym cycling | Language | "protagonist... main character... central figure..." |
| 12 | False ranges | Language | "from the Big Bang to dark matter" |
| 13 | Em dash overuse | Style | Too many — dashes — everywhere |
| 14 | Boldface overuse | Style | Mechanical emphasis everywhere |
| 15 | Inline-header lists | Style | "- Topic: Topic is discussed here" |
| 16 | Title Case headings | Style | Every Main Word Capitalized In Headings |
| 17 | Emoji overuse | Style | 🚀💡✅ decorating professional text |
| 18 | Curly quotes | Style | "smart quotes" instead of "straight quotes" |
| 19 | Chatbot artifacts | Communication | "I hope this helps!", "Let me know if..." |
| 20 | Cutoff disclaimers | Communication | "As of my last training...", "While details are limited..." |
| 21 | Sycophantic tone | Communication | "Great question!", "You're absolutely right!" |
| 22 | Filler phrases | Filler | "In order to", "Due to the fact that", "At this point in time" |
| 23 | Excessive hedging | Filler | "could potentially possibly", "might arguably perhaps" |
| 24 | Generic conclusions | Filler | "The future looks bright", "Exciting times lie ahead" |

## Vocabulary tiers

### Tier 1 — Dead giveaways (avoid entirely)
`delve`, `tapestry`, `vibrant`, `crucial`, `comprehensive`, `meticulous`, `embark`, `robust`, `seamless`, `groundbreaking`, `leveraging`, `synergy`, `transformative`, `paramount`, `multifaceted`, `myriad`, `cornerstone`, `reimagine`, `empower`, `catalyst`, `invaluable`, `bustling`, `nestled`, `realm`

### Tier 2 — Suspicious in density
`Furthermore`, `moreover`, `paradigm`, `holistic`, `utilize`, `facilitate`, `nuanced`, `illuminate`, `encompasses`, `catalyze`, `proactive`, `ubiquitous`, `quintessential`

### Phrases to kill
- "In today's digital age"
- "It is worth noting"
- "plays a crucial role"
- "serves as a testament"
- "in the realm of"
- "delve into"
- "harness the power of"
- "embark on a journey"
- "without further ado"

## Statistical signals

| Signal | Human | AI | Why |
|---|---|---|---|
| Burstiness | High (0.5-1.0) | Low (0.1-0.3) | Humans write in bursts; AI is metronomic |
| Type-token ratio | 0.5-0.7 | 0.3-0.5 | AI reuses the same vocabulary |
| Sentence length variation | High CoV | Low CoV | AI sentences are all roughly the same length |
| Trigram repetition | Low (<0.05) | High (>0.10) | AI reuses 3-word phrases |

## How to apply

When given text to humanize:
1. Scan for the 24 patterns above
2. Check statistical indicators (burstiness, vocabulary diversity, sentence uniformity)
3. Rewrite problematic sections with natural alternatives
4. Preserve the core meaning
5. Match the intended tone (formal, casual, technical)
6. Add actual personality — sterile text is just as obvious as slop

## Core principles

### Write like a human, not a press release
- Use "is" and "has" freely — "serves as" is pretentious
- One qualifier per claim — don't stack hedges
- Name your sources or drop the claim
- End with something specific, not "the future looks bright"

### Add personality
- Have opinions. React to facts, don't just report them
- Vary sentence rhythm. Short. Then longer ones that meander.
- Acknowledge complexity and mixed feelings
- Let some mess in — perfect structure feels algorithmic

### Cut the fat
- "In order to" → just do it
- "Due to the fact that" → because
- "At this point in time" → now
- "It is worth noting that" → [delete or rewrite]

---

_Source: ClawHub — Brandon Wise / AI Humanizer_