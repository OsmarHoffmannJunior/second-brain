# Chat Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nova aba `/chat` no Mission Control para conversar com agentes via interface WhatsApp-style. Integração via `openclaw sessions send` (CLI) — zero config nova no gateway.

**Architecture:** Browser → Next.js API Route → `execSync` → `openclaw sessions send` CLI → resposta JSON. Sem streaming SSE. Sessions persistidas por agente em `localStorage`.

**Tech Stack:** Next.js App Router, `execSync` (CLI), `localStorage`, CSS inline (padrão existente do MC).

---

## Configuração do Sistema

### Task 1: Nenhuma mudança necessária no gateway

**Status:** SKIP — o gateway já tem tudo que precisa (`sessions send` via CLI). Nenhuma config nova requerida.

- [ ] **Step 1: Confirmar que sessions send funciona**

```bash
openclaw sessions send --help 2>&1 | head -15
```

Verificar se o comando existe e mostra ajuda.

- [ ] **Step 2: Commit (no-op marker)**

```bash
cd /root/.openclaw/workspace && git add docs/superpowers/plans/ && git commit -m "chore(chat): Task 1 skip — gateway sessions CLI sufficient"
```

---

## API Routes (Next.js)

### Task 2: Criar `POST /api/chat/send`

**Arquivo:**
- Create: `src/app/api/chat/send/route.ts`

- [ ] **Step 1: Criar o arquivo**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { agentId, message, sessionId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Determinar session: usa provided sessionId ou cria novo
    // Se não tem sessionId, usa 'main' como default
    const targetSession = sessionId || 'main';

    // Montar prompt do sistema baseado no agentId
    const systemInstruction = agentId && agentId !== 'main'
      ? `You are the agent named '${agentId}'. Respond as that agent in Portuguese. Be concise and direct.`
      : 'You are Clara, the operations manager. Be direct, concise, and helpful in Portuguese.';

    // Montar mensagem completa com contexto do agente
    const fullMessage = `${systemInstruction}\n\nUser: ${message}`;

    // Chamar sessions send via CLI
    // --json output para facilitar parsing
    const result = execSync(
      `openclaw sessions send --session ${targetSession} --message ${JSON.stringify(fullMessage)} --json 2>/dev/null`,
      {
        encoding: 'utf-8',
        timeout: 120000, // 2min timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );

    let responseText = result.trim();

    // Tentar extrair texto do JSON de resposta
    try {
      const parsed = JSON.parse(result);
      // O sessions send pode retornar {text: "...", content: "..."} ou só texto
      responseText = parsed.text || parsed.content || parsed.message?.content || result;
    } catch {
      // Se não é JSON, usa o result como texto direto
    }

    return NextResponse.json({
      success: true,
      content: responseText,
      sessionId: targetSession,
    });
  } catch (error: any) {
    console.error('[chat/send] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/api/chat/send/route.ts && git commit -m "feat(chat): add sessions send API route"
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
      model: primaryModel,
      agent: 'main',
    });
  } catch {
    return NextResponse.json({ model: 'minimax-portal/MiniMax-M2.7', agent: 'main' });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/app/api/chat/models/route.ts && git commit -m "feat(chat): add models endpoint"
```

---

## Navegação

### Task 4: Adicionar link no Dock

**Arquivo:**
- Modify: `src/components/TenacitOS/Dock.tsx`

- [ ] **Step 1: Adicionar item Chat no Dock**

Encontrar o array de `items` no Dock e adicionar:

```typescript
{ href: "/chat", label: "Chat", icon: MessageCircle },
```

Importar `MessageCircle` do lucide-react se ainda não estiver importado.

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace/mission-control && git add src/components/TenacitOS/Dock.tsx && git commit -m "feat(nav): add Chat tab to Dock"
```

---

## UI — Página de Chat

### Task 5: Criar página e componentes de Chat

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

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ChatInput({ onSend, disabled, loading }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled || loading) return;
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
        placeholder={loading ? 'Aguardando resposta...' : 'Digite sua mensagem...'}
        disabled={disabled || loading}
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
        disabled={disabled || loading || !text.trim()}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          background: disabled || loading ? 'var(--border)' : 'var(--accent)',
          color: '#fff',
          cursor: (disabled || loading || !text.trim()) ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        {loading ? '...' : 'Enviar'}
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, message: text, sessionId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to send message');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Resposta vazia',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Gerar sessionId fake para persistência (não usado atualmente)
      if (!sessionId && data.sessionId) {
        onSessionIdChange(data.sessionId);
      }
    } catch (err: any) {
      setError(err.message);
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Erro: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && !loading && (
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
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '8px' }}>
            Clara está digitando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput
        onSend={handleSend}
        disabled={false}
        loading={loading}
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
cd ~/.worktrees/chat-feature/mission-control && npm run build 2>&1 | tail -20
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
4. Verificar resposta aparece (sem streaming — texto completo)
5. Recarregar página — mensagens persistem

---

## Checklist de Self-Review

- [ ] Spec coverage: todas as features do spec implementadas
- [ ] Placeholder scan: nenhum TBD/TODO no código
- [ ] Type consistency: interfaces consistentes entre componentes
- [ ] Commits granulares: cada task tem seu próprio commit
- [ ] Nenhuma config nova de gateway (usamos sessions send CLI)

---

## Notas de Deploy

- PM2 restart: `pm2 restart mission-control`
- Logs: `pm2 logs mission-control --lines 50`
- Gateway NÃO precisa de restart (não houve mudança)
