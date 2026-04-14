# Chat Feature — Design Spec

## Visão Geral

Nova aba `/chat` no Mission Control para conversar com agentes (Clara + futuros agentes). Integração direta via gateway OpenClaw. Cada agente tem sua própria tab com histórico persistente.

## Arquitetura

### Integração com OpenClaw Gateway

O gateway OpenClaw é contactado diretamente pela API do Mission Control (mesma máquina, via `localhost:18789` ou socket Unix).

**Alternativas de transporte:**
1. **HTTP API** (`POST /v1/messages`) — mais simples, polling ou reconnect
2. **WebSocket** (`/v1/stream`) — streaming nativo, ideal pra UI

**Recomendado:** WebSocket streaming. O gateway já suporta `text/event-stream` para respostas em tempo real.

### Sessões por Agente

- Cada tab de agente = uma session do gateway OpenClaw
- Session ID persiste em `localStorage` por `agentId`
- Histórico completo via `GET /v1/sessions/{sessionId}/messages`

### Fluxo de Dados

```
[UI: ChatTab] 
    → POST /api/chat/send { agentId, message, sessionId? }
    → [Server: route.ts] 
    → [OpenClaw Gateway: process message]
    → [SSE stream back]
    → [UI: render bubbles in real-time]
```

## Decisões de Design

| Decisão | Escolha |
|---------|---------|
| Transporte | WebSocket/SSE streaming |
| Histórico | Persistente por agente (session storage) |
| UI Style | WhatsApp-style (bolhas azul/direita, cinza/esquerda) |
| Multi-agent | Tabs no topo (uma por agente) |
| Backend | Gateway OpenClaw (já existente) |

## Estrutura de Arquivos

```
src/app/(dashboard)/chat/
├── page.tsx                    — layout com tabs + outlet
├── layout.tsx                  — tabs bar
├── components/
│   ├── ChatTab.tsx             — uma tab de conversa
│   ├── ChatBubble.tsx          — bolha de mensagem
│   ├── ChatInput.tsx           — campo de input + send
│   └── AgentTabBar.tsx         — barra de tabs no topo
├── api/
│   └── chat/
│       ├── send/route.ts       — POST: envia mensagem ao gateway
│       ├── sessions/route.ts   — GET: lista/cria sessions por agente
│       └── history/route.ts    — GET: histórico de messages
```

## Componentes

### `AgentTabBar`
- Lista de agentes (do `/api/agents`)
- Tab ativa = session corrente
- Indicador de "online" ou "thinking..." (streaming)

### `ChatTab`
- Lista de `ChatBubble` (scrollável)
- `ChatInput` fixo no bottom
- Auto-scroll ao receber mensagem

### `ChatBubble`
```
-user message (azul, direita):
  "Olá Clara"
  14:23 ✓✓

-agent message (cinza, esquerda):
  Clara: Olá! Como posso ajudar?
  14:23
```

### `ChatInput`
- Textarea (Enter = send, Shift+Enter = newline)
- Indicador de "thinking..." durante stream
- Disabled enquanto aguardando resposta

## API Routes

### `POST /api/chat/send`
```typescript
// Request
{ agentId: string, message: string, sessionId?: string }

// Response (SSE)
event: message
data: { content: string, done: boolean }
event: error
data: { error: string }
```

Se `sessionId` não fornecido, cria nova session para o agente.

### `GET /api/chat/sessions?agentId={id}`
```typescript
// Response
{ sessions: [{ id: string, agentId: string, createdAt: string }] }
```

### `GET /api/chat/history?sessionId={id}`
```typescript
// Response
{ messages: [{ role: "user"|"agent", content: string, timestamp: string }] }
```

## Questões em Aberto

1. **Gateway socket path**: `/root/.openclaw/gateway.sock` ou `http://localhost:18789`?
2. **Auth**: O Mission Control já tem cookie de sessão. Gateway vai validar via mesmo token?
3. **Agents dinâmicos**: Onde buscar a lista de agentes disponíveis? (`/api/agents` do MC ou `gateway/config/agents`?)

## Spec Self-Review

- [x] Placeholder scan: nenhum TBD/TODO
- [x] Consistência interna: API routes matched com componentes
- [x] Scope: focado numa feature (chat UI + 3 API routes)
- [x] Ambiguidade: escolhi WebSocket/SSE como transporte

---

Aprovado por: Osmar
Data: 2026-04-14
