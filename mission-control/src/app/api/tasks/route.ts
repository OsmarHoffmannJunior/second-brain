import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask, updateTask, deleteTask, getTaskById } from '@/lib/tasks-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const filters: Record<string, string> = {};

    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const category = url.searchParams.get('category');
    const assigned_to = url.searchParams.get('assigned_to');

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (assigned_to) filters.assigned_to = assigned_to;

    const tasks = getAllTasks(Object.keys(filters).length > 0 ? filters : undefined);
    return NextResponse.json({ tasks, total: tasks.length });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ error: 'title is required and must be non-empty' }, { status: 400 });
    }

    const task = createTask({
      title: body.title,
      description: body.description ?? null,
      status: body.status,
      priority: body.priority,
      category: body.category,
      assigned_to: body.assigned_to ?? null,
      due_date: body.due_date ?? null,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const task = updateTask(body.id, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      category: body.category,
      assigned_to: body.assigned_to,
      track_status: body.track_status,
      due_date: body.due_date,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('PUT /api/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const exists = getTaskById(id);
    if (!exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
