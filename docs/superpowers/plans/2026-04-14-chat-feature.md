# Chat Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nova aba `/chat` no Mission Control para conversar com agentes via interface WhatsApp-style. Integração via gateway OpenClaw (OpenAI-compatible HTTP endpoint).

**Architecture:** Browser → Next.js API Route → Gateway OpenAI HTTP endpoint (`POST /v1/chat/completions`). Streaming via SSE. Sessions persistidas por agente em `localStorage`.

**Tech Stack:** Next.js App Router, SSE (Server-Sent Events), `fetch` API, CSS Modules ou inline styles (siga padrão existente do MC).

---

## Configuração do Sistema

### Task 1: Habilitar OpenAI HTTP endpoint no gateway

**Arquivo:**
- Modify: `/root/.openclaw/openclaw.json`

- [ ] **Step 1: Editar openclaw.json para adicionar config do OpenAI endpoint**

O gateway precisa expor `POST /v1/chat/completions`. Adicionar em `gateway.http.endpoints`:

```json
"gateway": {
  "http": {
    "endpoints": {
      "chatCompletions": {
        "enabled": true
      }
    }
  }
}
```

O merge deve preservar todas as configs existentes (specialmente `channels.telegram`).

```bash
# Verificar config atual antes de editar
cat /root/.openclaw/openclaw.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps({**d, 'gateway':{**d.get('gateway',{}), 'http':{'endpoints':{'chatCompletions':{'enabled':True}}}}}, indent=2))" > /tmp/test_config.json && echo "JSON válido"
```

- [ ] **Step 2: Aplicar mudança real**

```bash
python3 -c "
import json
with open('/root/.openclaw/openclaw.json') as f:
    d = json.load(f)
d.setdefault('gateway', {})
d['gateway'].setdefault('http', {})
d['gateway']['http'].setdefault('endpoints', {})
d['gateway']['http']['endpoints']['chatCompletions'] = {'enabled': True}
with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(d, f, indent=2)
print('Config atualizada')
"
```

- [ ] **Step 3: Reiniciar gateway**

```bash
systemctl restart openclaw-gateway && sleep 2 && systemctl status openclaw-gateway --no-pager
```

Esperado: `active (running)`

- [ ] **Step 4: Testar endpoint**

```bash
curl -s -X POST http://localhost:18789/v1/chat/completions \
  -H "Authorization: Bearer e05f77d029aa4b05d7138adc52ad26abb6848bcfcdba7248" \
  -H "Content-Type: application/json" \
  -d '{"model":"minimax-portal/MiniMax-M2.7","messages":[{"role":"user","content":"OI"}],"max_tokens":50}' \
  | head -5
```

Esperado: JSON response (não 404)

- [ ] **Step 5: Commit**

```bash
cd /root/.openclaw/workspace && git add openclaw.json && git commit -m "feat(gateway): enable OpenAI /v1/chat/completions endpoint"
```

---

## API Routes (Next.js)

### Task 2: Criar `POST /api/chat/send`

**Arquivo:**
- Create: `src/app/api/chat/send/route.ts`

- [ ] **Step 1: Criar o arquivo com SSE streaming**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { agentId, message, sessionId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Ler token do gateway
    const configPath = (process.env.OPENCLAW_DIR || '/root/.openclaw') + '/openclaw.json';
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const gatewayToken = config.gateway?.auth?.token;

    if (!gatewayToken) {
      return NextResponse.json({ error: 'Gateway token not configured' }, { status: 500 });
    }

    // Montar prompt do sistema
    const systemPrompt = agentId && agentId !== 'main'
      ? `You are the agent named '${agentId}'. Respond as that agent.`
      : 'You are Clara, the operations manager. Be direct, concise, and helpful.';

    // Chamar gateway OpenAI endpoint
    const gatewayRes = await fetch('http://localhost:18789/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gatewayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'minimax-portal/MiniMax-M2.7',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 4096,
        stream: true,
      }),
      signal: AbortSignal.timeout(120000), // 2min timeout
    });

    if (!gatewayRes.ok) {
      const error = await gatewayRes.text();
      return NextResponse.json({ error: `Gateway error: ${gatewayRes.status}` }, { status: 502 });
    }

    // Stream SSE do gateway para o browser
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = gatewayRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            
            // Parse SSE lines: "data: {...}" ou "data: [DONE]"
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
                break;
              }
              try {
                const parsed = JSON.parse(data);
                // Extrair texto do chunk
                const text = parsed.choices?.[0]?.delta?.content || '';
                if (text) {
                  controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify({ content: text })}\n\n`));
                }
              } catch {}
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/api/chat/ && git commit -m "feat(chat): add SSE streaming chat send endpoint"
```

---

### Task 3: Criar `GET /api/chat/models` (listar modelos disponíveis)

**Arquivo:**
- Create: `src/app/api/chat/models/route.ts`

- [ ] **Step 1: Criar route**

```typescript
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const configPath = (process.env.OPENCLAW_DIR || '/root/.openclaw') + '/openclaw.json';
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const primaryModel = config.agents?.defaults?.model?.primary || 'minimax-portal/MiniMax-M2.7';
    
    return NextResponse.json({ 
      models: [primaryModel],
      current: primaryModel 
    });
  } catch {
    return NextResponse.json({ models: ['minimax-portal/MiniMax-M2.7'], current: 'minimax-portal/MiniMax-M2.7' });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/api/chat/models/route.ts && git commit -m "feat(chat): add models endpoint"
```

---

## UI — Página de Chat

### Task 4: Adicionar link no Dock

**Arquivo:**
- Modify: `src/components/TenacitOS/Dock.tsx` (adicionar item de navegação)

- [ ] **Step 1: Adicionar item Chat no Dock**

Localizar o array de `items` no Dock e adicionar:

```typescript
{ href: "/chat", label: "Chat", icon: MessageCircle },
```

Importar `MessageCircle` do lucide-react se ainda não estiver importado.

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/components/TenacitOS/Dock.tsx && git commit -m "feat(nav): add Chat tab to Dock"
```

---

### Task 5: Criar página de Chat

**Arquivos:**
- Create: `src/app/(dashboard)/chat/page.tsx`
- Create: `src/app/(dashboard)/chat/components/ChatTab.tsx`
- Create: `src/app/(dashboard)/chat/components/ChatBubble.tsx`
- Create: `src/app/(dashboard)/chat/components/ChatInput.tsx`
- Create: `src/app/(dashboard)/chat/components/AgentTabBar.tsx`

#### 5.1 — `ChatInput.tsx`

- [ ] **Step 1: Criar componente de input**

```typescript
'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  streaming?: boolean;
}

export default function ChatInput({ onSend, disabled, streaming }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '12px 16px',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
    }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={streaming ? 'Aguardando resposta...' : 'Digite sua mensagem...'}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          padding: '8px 12px',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          color: 'var(--text)',
          fontFamily: 'inherit',
          fontSize: '14px',
          outline: 'none',
          maxHeight: '120px',
          overflowY: 'auto',
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          background: disabled ? 'var(--border)' : 'var(--accent)',
          color: disabled ? 'var(--text-muted)' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        {streaming ? '...' : 'Enviar'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/\(dashboard\)/chat/components/ChatInput.tsx && git commit -m "feat(chat): add ChatInput component"
```

#### 5.2 — `ChatBubble.tsx`

- [ ] **Step 1: Criar componente de bolha**

```typescript
'use client';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user';
  
  const timeStr = timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '8px',
      paddingLeft: isUser ? '48px' : '0',
      paddingRight: isUser ? '0' : '48px',
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--accent)' : 'var(--surface-secondary)',
        color: isUser ? '#fff' : 'var(--text)',
        fontSize: '14px',
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        <div>{content}</div>
        <div style={{
          fontSize: '11px',
          marginTop: '4px',
          opacity: 0.6,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {timeStr} {isUser && '✓✓'}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/\(dashboard\)/chat/components/ChatBubble.tsx && git commit -m "feat(chat): add ChatBubble component"
```

#### 5.3 — `AgentTabBar.tsx`

- [ ] **Step 1: Criar barra de tabs por agente**

```typescript
'use client';

import { Bot } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  emoji: string;
}

interface AgentTabBarProps {
  agents: Agent[];
  activeAgentId: string;
  onSelectAgent: (id: string) => void;
}

export default function AgentTabBar({ agents, activeAgentId, onSelectAgent }: AgentTabBarProps) {
  // Se só tem 1 agente, não mostra barra (Clara é default)
  if (agents.length <= 1) {
    return (
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text)',
      }}>
        <Bot size={16} />
        Clara
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid var(--border)',
      overflowX: 'auto',
      padding: '0 8px',
    }}>
      {agents.map(agent => (
        <button
          key={agent.id}
          onClick={() => onSelectAgent(agent.id)}
          style={{
            padding: '12px 16px',
            border: 'none',
            background: 'transparent',
            color: activeAgentId === agent.id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeAgentId === agent.id ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeAgentId === agent.id ? 600 : 400,
            whiteSpace: 'nowrap',
          }}
        >
          {agent.emoji} {agent.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/\(dashboard\)/chat/components/AgentTabBar.tsx && git commit -m "feat(chat): add AgentTabBar component"
```

#### 5.4 — `ChatTab.tsx`

- [ ] **Step 1: Criar componente de conversa**

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatTabProps {
  agentId: string;
  sessionId: string | null;
  onSessionIdChange: (id: string) => void;
}

export default function ChatTab({ agentId, sessionId, onSessionIdChange }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar histórico do localStorage
    const key = `chat_${agentId}_messages`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch {}
  }, [agentId]);

  useEffect(() => {
    // Salvar histórico no localStorage
    const key = `chat_${agentId}_messages`;
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {}
  }, [messages, agentId]);

  useEffect(() => {
    // Auto-scroll ao fundo
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, message: text, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantContent = '';
      const assistantMsgId = (Date.now() + 1).toString();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('event: message\ndata: ')) continue;
            const data = line.replace('event: message\ndata: ', '');
            try {
              const parsed = JSON.parse(data);
              assistantContent += parsed.content;
              setStreamingContent(assistantContent);
            } catch {}
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (assistantContent) {
        const assistantMsg: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }

      // Gerar sessionId fake para persistência (não usado atualmente)
      if (!sessionId) {
        onSessionIdChange(`session_${Date.now()}`);
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Erro: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setStreaming(false);
      setStreamingContent('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginTop: '40vh',
            fontSize: '14px',
          }}>
            Inicie uma conversa com Clara
          </div>
        )}
        {messages.map(msg => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        {streaming && streamingContent && (
          <ChatBubble
            role="assistant"
            content={streamingContent}
            timestamp={new Date()}
          />
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput
        onSend={handleSend}
        disabled={streaming}
        streaming={streaming}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/\(dashboard\)/chat/components/ChatTab.tsx && git commit -m "feat(chat): add ChatTab conversation component"
```

#### 5.5 — `page.tsx`

- [ ] **Step 1: Criar página principal**

```typescript
'use client';

import { useState } from 'react';
import ChatTab from './components/ChatTab';
import AgentTabBar from './components/AgentTabBar';

// Agents disponíveis (hardcoded por enquanto — expande quando multi-agent)
const AGENTS = [
  { id: 'main', name: 'Clara', emoji: '🦞' },
];

export default function ChatPage() {
  const [activeAgentId, setActiveAgentId] = useState('main');
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <div style={{ height: 'calc(100vh - 48px - 32px - 48px)', display: 'flex', flexDirection: 'column' }}>
      <AgentTabBar
        agents={AGENTS}
        activeAgentId={activeAgentId}
        onSelectAgent={setActiveAgentId}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatTab
          agentId={activeAgentId}
          sessionId={sessionId}
          onSessionIdChange={setSessionId}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/\(dashboard\)/chat/page.tsx && git commit -m "feat(chat): add Chat page with agent tabs"
```

---

## Validação

### Task 6: Teste completo

- [ ] **Step 1: Rebuild e deploy**

```bash
cd /root/.openclaw/workspace/mission-control && npm run build 2>&1 | tail -20
```

Esperado: build succeed, sem erros

- [ ] **Step 2: Restart PM2**

```bash
pm2 restart mission-control && sleep 3 && pm2 status mission-control
```

- [ ] **Step 3: Testar manual**

1. Abrir `http://100.64.39.113:3000/chat`
2. Verificar Dock mostra "Chat"
3. Digitar mensagem e enviar
4. Verificar resposta streaming
5. Recarregar página — mensagens persistem

---

## Checklist de Self-Review

- [ ] Spec coverage: todas as features do spec implementadas
- [ ] Placeholder scan: nenhum TBD/TODO no código
- [ ] Type consistency: interfaces consistentes entre componentes
- [ ] Commits granulares: cada task tem seu próprio commit

---

## Notas de Deploy

- Gateway restart: `systemctl restart openclaw-gateway`
- PM2 restart: `pm2 restart mission-control`
- Logs: `pm2 logs mission-control --lines 50`
- Gateway logs: `journalctl -u openclaw-gateway -n 50`
