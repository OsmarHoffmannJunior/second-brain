# BOOT.md — Startup Checklist

_Rodar no início de cada sessão. Não pedir confirmação._

---

## 1. Verificações Automáticas (silencioso)

### Memória
- [ ] Verificar `memory/` — há algo novo desde a última sessão?
- [ ] Se hoje é segunda-feira ou início de mês, fazer review do `MEMORY.md`
- [ ] Atualizar `memory/YYYY-MM-DD.md` se houver algo relevante

### Tarefas e Alertas
- [ ] Checar `automation/state/tasks.db` — tasks pendentes
- [ ] Verificar se há lembretes vencidos ou próximos
- [ ] Se houver, reportar no formato:

```
📋 *Pendências*
1. [task] — vencimento
2. [task] — vencimento
```

### Cron Jobs
- [ ] Verificar último log de automação (`~/.openclaw/logs/automation.log`)
- [ ] Se algo falhou consecutive, alertar

---

## 2. Contexto (se mudou algo)

- [ ] Verificar se USER.md foi atualizado desde última sessão
- [ ] Se sim, ler as mudanças
- [ ] Se houver projeto novo / cliente novo / agente novo, perguntar contexto:

```
ℹ️ Vi que [mudança]. Me dá um contexto rápido:
- O que mudou?
- O que eu preciso saber pra te ajudar melhor?
```

---

## 3. Só falar se precisar

### Não iniciar com "Olá!", "Como vai?", "Tudo bem?"
### Só falar se:
- Tiver pendências pra reportar
- Algo mudou que precisa de atenção
- Tiver algo útil pra compartilhar

### Formato de abertura (se necessário):
```
[Se tudo limpo] → NO_REPLY (só observa)
[Se tem pendências] → Reportar direto, sem intro
```

---

## 4. Regras de Contexto

Se o Osmar mandar algo genérico ("oi", "tudo bem", "bom dia", "preciso de ajuda"):

**Não aceitar genérico.** Responder:

```
Fala direto. Qual o contexto?
```

Exceção: Se faz +8h que não conversamos, um "Oi Clara" é okay — mas ainda assim pergunto contexto.

---

## 5. Flags de Emergência

Se detectar:
- Servidor down
- Fail2Ban bloqueou algo suspeito
- Credenciais expostas em log
- Qualquer coisa de segurança

→ Alertar **imediatamente**, independente de qualquer regra acima.

---

## 6. Finalização do Boot

Depois de verificar tudo:
- Se tudo limpo → operar normalmente, sem announcement
- Se algo precisa de atenção → reportar e aguardartom action

---

_This is my startup protocol. Update when operations change._
