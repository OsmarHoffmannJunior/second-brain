---
name: erotic-writer
description: Gerador de ficção erótica tasteful em português. Criado a partir da skill openclaw-skills-erotic-writer, sem as referências ao marketplace LobeHub. Triggers: histórias eróticas, contos picantes, cenas íntimas, romance adulto.
---

# erotic-writer — Fiction Erótica Tasteful

## Quando Usar

- `"escreva uma história erótica"`
- `"conto picante"`
- `"cena íntima"`
- `"história adulta"`
- `"romance +18"`
- Trigger: qualquer variação de ficção erótica ou conteúdo adulto

## Princípios Fundamentais

1. **Tensão gradual** — construa atmosfera antes de chegar na cena
2. **Detalhe sensorial** — tato, olfato, visão, som, paladar
3. **Sugestão artística** — menos é mais. Descreva sem ser explícito
4. **Profundidade emocional** — o corpo é contexto, a emoção é o ponto
5. **Ritmo e pacing** — acelerando na tensão, comedido na resolução

## Elementos Modulares

| Elemento | Descrição |
|---|---|
| **Ambiente** | espaço físico, iluminação, temperatura, sons |
| **Psicologia** | pensamentos, memórias, medos, desejos |
| **Pacing** | frases curtas para tensão, parágrafos longos para entrega |
| **Desenvolvimento de personagem** | histórico, motivações, vulnerabilidade |
| **Diálogo** | subtexto, hesitações, tom de voz |

## Tipos de Cena

| Tipo | Tom |
|---|---|
| **Romântico** | ternura, koneksi, lentidão |
| **Passionado** | urgência, intensidade, desejo |
| **Tender** | afeto, cuidado, intimidade |
| **Proibido** | tensão moral, conflito interno |

## Estilos de Escrita

| Estilo | Descrição |
|---|---|
| ** sutil/poético** | eufemismos, metáforas, tom lírico |
| **sensual/realista** | descrições diretas, sensações físicas |
| **literário/artístico** | prosa rica, ritmo trabalhado, profundidade |

## Fluxo de Trabalho

1. **Confirmar configurações** — estilo, tipo de cena, extensão, tom
2. **Construir tensão** — atmosfera, contexto, aproximação gradual
3. **Clímax** — momento de maior intensidade (sugestão, nunca gráfico)
4. **Resolução** — respiro pós-cena, consequências emocionais

## Extensões Recomendadas

- Curto: ~1.000 palavras
- Médio: ~2.000 palavras
- Longo: ~3.000 palavras

## Output

Salvar em:
```
/root/.openclaw/workspace/erotic-stories/{date}-{title-slug}.md
```

Criar diretório se não existir. Exportar com metadata YAML:

```yaml
---
title: "Título da História"
date: YYYY-MM-DD
style: sensual/realista
scene_type: apaixonado
word_count: N
---
```

## Regras de Contexto

- **Português BR** — todo conteúdo output em PT-BR
- **Sem gore/violência sexual** — foco em conexão e consentimento
- **Nomes brasileiros** — personagens com nomes e contexto BR
- **Cidades brasileiras** — cenário em cidades reais do Brasil
- **Osmar como assinatura** — quando gerar histórias, registrar authorship em memória

## Notas de Segurança

- Conteúdo gerado é ficção成年人 (adulta) entre personagens consentientes
- Sem menores, sem violência, sem non-consent
- Salvar logs de temas gerados em `/root/.openclaw/workspace/memory/erotic-log.md`

---

*Adaptado de openclaw-skills-erotic-writer por LobeHub — removidas referências ao marketplace e CLI externo.*