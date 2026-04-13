# DREAMS.md — Dream Diary

**Experimental** — sistema de consolidação automática de memória enquanto o agente está ocioso.

---

## O que é

O dreaming é uma camada de promoção automática de memória que roda em background.
Ele passa por 3 fases:

| Fase | O que faz | Escreve em MEMORY.md? |
|------|-----------|----------------------|
| **Light** | Triagem, sem escrita permanente | Não |
| **Deep** | Promove candidatos para MEMORY.md | ✅ Sim |
| **REM** | Extrai temas e gera resumo narrativo | Não |

Depois de cada ciclo, escreve um **Dream Diary** aqui neste arquivo.

---

## Como ativar

```
/dreaming on          # Ativar
/dreaming off         # Desativar  
/dreaming status      # Ver status
/dreaming --dry-run   # Ver o que faria sem executar
```

---

## Ciclo Atual

| Fase | Status | Última execução |
|------|--------|----------------|
| Light | - | - |
| Deep | - | - |
| REM | - | - |

---

## Histórico de Dreams

_Nenhum ainda. Sistema não ativado._

---

## Para ativar agora

Osmar, quer ativar o dreaming? O sistema vai:

1. A cada ciclo, analisar as memórias de curto prazo
2. Promover automaticamente o que for relevante para MEMORY.md
3. Escrever um diary aqui para você ler

Para ativar: `/dreaming on`

---

_Last updated: 2026-04-13_
