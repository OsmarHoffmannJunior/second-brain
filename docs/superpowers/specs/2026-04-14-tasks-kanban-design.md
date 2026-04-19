# Tasks Kanban — Mission Control

## 1. Concept & Vision

Quadro Kanban dentro do Mission Control para rastrear ações de SEO e desenvolvimento. Cada card é uma tarefa que pode ser atribuída a `@osmar` (humano) ou `@clara` (agente Clara). O quadro serve como fonte de verdade para quem está fazendo o quê — sem redundância com cron jobs ou sessões.

**Tom:** operacional, direto. Sem fluff corporativo.

---

## 2. Design Language

**Aesthetic:** Corporate Dark Mode — mesmo padrão do resto do MC (vars CSS customizadas, não翻新作坊).

**Palette:**
- Background: `var(--bg)` / `var(--surface)`
- Border: `var(--border)`
- Text: `var(--text)` / `var(--text-secondary)`
- Accent: `var(--accent)` — usado em drag active state
- Priority badges:
  - Urgent: `#ef4444` (red)
  - Normal: `#eab308` (yellow)
  - Someday: `#3b82f6` (blue)
- Track status:
  - On Track: `#22c55e` (green)
  - At Risk: `#f97316` (orange)
  - Off Track: `#ef4444` (red)

**Typography:** Tailwind defaults + `var(--font-heading)` onde aplicável.

**Spatial system:** Padding 16px em cards, gap 12px entre cards, colunas com 280px min-width.

**Motion:** Transição de 200ms ao mover card (sem bounce — confirmação depois). Loading spinner no card durante confirmação.

---

## 3. Layout & Structure

### Page `/tasks`

```
┌──────────────────────────────────────────────────────────────┐
│ Header: "Tasks" + "Add Task" button + filters (priority/category)
├───────────────┬───────────────┬───────────────┬───────────────┤
│ BACKLOG       │ IN PROGRESS   │ REVIEWING     │ DONE          │
│ (kanban-col)  │ (kanban-col)  │ (kanban-col)  │ (kanban-col)  │
│               │               │               │               │
│ [+ Add]       │ [+ Add]       │ [+ Add]       │ [+ Add]       │
│               │               │               │               │
│ ┌───────────┐ │ ┌───────────┐ │               │ ┌───────────┐ │
│ │ Card      │ │ │ Card      │ │               │ │ Card      │ │
│ │ ─ Priority│ │ │ ─ Priority│ │               │ │ ─ Priority│ │
│ │ ─ Date   │ │ │ ─ Date   │ │               │ │ ─ Date   │ │
│ └───────────┘ │ └───────────┘ │               │ └───────────┘ │
│               │               │               │               │
│ ┌───────────┐ │               │               │               │
│ │ Card      │ │               │               │               │
│ └───────────┘ │               │               │               │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

**Responsive:** Em mobile (<768px), colunas empilham horizontalmente com scroll. Em desktop, 4 colunas visíveis.

**Drag state:** Card being dragged fica semi-transparente (opacity 0.5) + placeholder no lugar original mostra espaço vazio. Card segue cursor — sem confirmação visual no drop ainda.

**Drop confirmation:** Ao soltar em nova coluna:
1. Card fica com spinner + "Saving..." overlay
2. DB write executa
3. Se sucesso → spinner some, card permanece
4. Se falha → card anima de volta pra coluna original + toast de erro

---

## 4. Features & Interactions

### 4.1 Cards

**Display:** Título (bold), priority badge, category tag, assigned_to avatar, due_date (se existir), track_status indicator.

**Click → Edit modal:** Abre modal com todos os campos editáveis.

**Drag → Move:** Arrasta entre colunas. Só altera `status` (os outros campos são edit via modal).

**Hover:** Borda levemente mais clara (`var(--border)` → `var(--accent)`).

### 4.2 Add Task (Quick)

**Local:** Botão `[+ Add]` no header de cada coluna.

**Flow:**
1. Click `[+ Add]` → Input inline aparece no topo da coluna
2. Type título + Enter → Card criado com defaults (status = coluna, priority = Normal, assigned_to = empty)
3. Esc → cancela
4. Card aparece imediatamente (optimistic) mas spinner показывает wait for DB

### 4.3 Add Task (Full)

**Local:** Botão "Add Task" no header da página.

**Flow:** Modal com todos os campos do schema (título, descrição, priority, category, assigned_to, due_date, track_status).

### 4.4 Edit Task

**Local:** Click em qualquer card.

**Flow:** Modal abre com valores atuais. Todos os campos editáveis. Botão "Save" + "Delete" + "Cancel".

### 4.5 Delete Task

**Local:** Dentro do edit modal.

**Flow:** Click "Delete" → confirmação "Sure?" (segundo click). DELETE no DB → card some com animação fade-out.

### 4.6 Filters

**Local:** Header da página, abaixo do título.

**Options:**
- Priority: All / Urgent / Normal / Someday
- Category: All / Work / Marketing / Development / Personal
- Assigned: All / @osmar / @clara / Unassigned

Filters são AND entre si. URL params atualizam (`?priority=urgent&category=marketing`).

### 4.7 Empty States

- Coluna vazia: "No tasks" + hint de arrastar ou criar.
- Filtro sem resultados: "No tasks match your filters" + botão "Clear filters".

---

## 5. Component Inventory

### `TasksPage` (`src/app/(dashboard)/tasks/page.tsx`)
- Client component
- Fetch tasks on mount
- Gerencia state: tasks[], filters, dragging state
- Renderiza: header, filter bar, KanbanBoard

### `KanbanBoard` (`src/components/Tasks/KanbanBoard.tsx`)
- Wraps @hello-pangea/dnd `DragDropContext` + `Droppable` por coluna
- Recebe: tasks[], onMove, onAdd, onEdit
- Mantém `isDragging` + `pendingDrop` state

### `KanbanColumn` (`src/components/Tasks/KanbanColumn.tsx`)
- `Droppable` individual
- Header: column name + count badge + [+ Add] button
- Scroll vertical se muitos cards
- Empty state quando sem tasks

### `TaskCard` (`src/components/Tasks/TaskCard.tsx`)
- `Draggable`
- Display fields: title, priority badge, category, assigned, due_date, track_status dot
- States: default, hover (border highlight), dragging (opacity 0.5, shadow), pending (spinner overlay)
- Click → abre EditModal

### `TaskModal` (`src/components/Tasks/TaskModal.tsx`)
- Modal (portal) com form completo
- Fields: title (required), description, priority (select), category (select), assigned_to (select), track_status (select), due_date (date input)
- Actions: Save / Delete / Cancel
- Validation: title required, min 1 char

### `PriorityBadge` (`src/components/Tasks/PriorityBadge.tsx`)
- Props: priority ('urgent' | 'normal' | 'someday')
- Renders colored chip

### `AssigneeAvatar` (`src/components/Tasks/AssigneeAvatar.tsx`)
- Props: assigned_to string | null
- Shows @name ou "Unassigned" com ícone

### `TrackStatusDot` (`src/components/Tasks/TrackStatusDot.tsx`)
- Props: status ('on_track' | 'at_risk' | 'off_track')
- Colored dot (green/orange/red) + tooltip

---

## 6. Technical Approach

### Stack
- **Framework:** Next.js App Router (same as MC)
- **Drag-and-drop:** `@hello-pangea/dnd`
- **Styling:** Tailwind CSS (existing MC setup)
- **Icons:** `lucide-react` (already installed)
- **Database:** SQLite via `better-sqlite3` (existing pattern in MC)
- **State:** React `useState` + `useCallback` — no external state manager needed

### Database Schema

```sql
CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'backlog'
              CHECK (status IN ('backlog','in_progress','review','done')),
  priority    TEXT NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('urgent','normal','someday')),
  category    TEXT NOT NULL DEFAULT 'work'
              CHECK (category IN ('work','marketing','development','personal')),
  assigned_to TEXT,
  track_status TEXT NOT NULL DEFAULT 'on_track'
              CHECK (track_status IN ('on_track','at_risk','off_track')),
  due_date    TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX idx_tasks_status     ON tasks(status);
CREATE INDEX idx_tasks_priority  ON tasks(priority);
CREATE INDEX idx_tasks_category  ON tasks(category);
CREATE INDEX idx_tasks_assigned  ON tasks(assigned_to);
```

**Path:** `mission-control/data/tasks.db`

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List all tasks (with filters via query params) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks` | Update task (full or partial) |
| DELETE | `/api/tasks?id=xxx` | Delete task |

**Filters (GET `/api/tasks`):** `?status=&priority=&category=&assigned_to=`

### File Structure

```
mission-control/src/
├── app/
│   ├── (dashboard)/
│   │   └── tasks/
│   │       └── page.tsx              ← TasksPage
│   └── api/
│       └── tasks/
│           └── route.ts              ← GET, POST, PUT, DELETE
└── components/
    └── Tasks/
        ├── KanbanBoard.tsx
        ├── KanbanColumn.tsx
        ├── TaskCard.tsx
        ├── TaskModal.tsx
        ├── PriorityBadge.tsx
        ├── AssigneeAvatar.tsx
        ├── TrackStatusDot.tsx
        └── index.ts                  ← barrel export
```

### Data Flow

```
User drags card
    ↓
KanbanBoard.onDragEnd({ draggableId, source, destination })
    ↓
setPendingDrop({ cardId, fromCol, toCol })
    ↓
Card shows spinner (dragging state)
    ↓
fetch(PUT /api/tasks, { id, status: newStatus })
    ↓
DB write in tasks.db
    ↓
if (success) {
  setPendingDrop(null)
  card stays in new column
} else {
  setPendingDrop(null)
  animate card back to source
  show toast error
}
```

### Seed / Example Data

None initially — empty board. Clara can populate via future agent integration.

---

## 7. Agent Integration (Future)

Quando novos agentes forem adicionados ao `openclaw.json`, o dropdown de `assigned_to` deve listar automaticamente:
- `@osmar` (human, always first)
- `@clara` (default agent, always second)
- Agents from `config.agents.list[].id`

Isso é v2 — não escopo desta primeira versão.

---

## 8. Out of Scope (v1)

- Subtasks
- Comments / discussions
- Due date notifications
- Recurring tasks
- Multi-board (one board only)
- Export to CSV
- Bulk operations
- Drag between multiple boards
