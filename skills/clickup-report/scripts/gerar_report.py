#!/usr/bin/env python3
"""
ClickUp Report Generator
Usage: python3 gerar_report.py [projeto] [dias_atras] [dias_frente]
Example: python3 gerar_report.py santtas 7 7
"""
import sys, json, urllib.request, urllib.parse
from datetime import datetime, timedelta

CREDS = "/root/.openclaw/credentials/clickup.json"

def load_creds():
    with open(CREDS) as f:
        return json.load(f)

def get_project_list_id(creds, project_name):
    """Find list ID by project name (folder)."""
    space_id = creds["space_id"]
    token = creds["api_token"]
    
    url = f"https://api.clickup.com/api/v2/space/{space_id}/folder?archived=false"
    req = urllib.request.Request(url, headers={"Authorization": token})
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
    
    folders = data.get("folders", [])
    for f in folders:
        if project_name.lower() in f["name"].lower():
            # Found folder, get lists inside
            list_url = f"https://api.clickup.com/api/v2/folder/{f['id']}/list?archived=false"
            list_req = urllib.request.Request(list_url, headers={"Authorization": token})
            with urllib.request.urlopen(list_req) as lr:
                list_data = json.loads(lr.read())
            lists = list_data.get("lists", [])
            if lists:
                return lists[0]["id"], f["name"], lists[0]["name"]
    return None, None, None

def fetch_tasks_by_list(creds, list_id, include_closed=True):
    """Fetch all tasks from a list."""
    token = creds["api_token"]
    params = urllib.parse.urlencode({"include_closed": str(include_closed).lower()})
    url = f"https://api.clickup.com/api/v2/list/{list_id}/task?{params}"
    req = urllib.request.Request(url, headers={"Authorization": token})
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
    return data.get("tasks", [])

def fetch_all_tasks_by_project(creds, project_name):
    """Fetch all tasks from all lists in a project folder."""
    token = creds["api_token"]
    space_id = creds["space_id"]
    
    url = f"https://api.clickup.com/api/v2/space/{space_id}/folder?archived=false"
    req = urllib.request.Request(url, headers={"Authorization": token})
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
    
    all_tasks = []
    for f in data.get("folders", []):
        if project_name.lower() not in f["name"].lower():
            continue
        list_url = f"https://api.clickup.com/api/v2/folder/{f['id']}/list?archived=false"
        list_req = urllib.request.Request(list_url, headers={"Authorization": token})
        with urllib.request.urlopen(list_req) as lr:
            list_data = json.loads(lr.read())
        for lst in list_data.get("lists", []):
            tasks = fetch_tasks_by_list(creds, lst["id"], include_closed=True)
            for t in tasks:
                t["_folder"] = f["name"]
                t["_list"] = lst["name"]
            all_tasks.extend(tasks)
    return all_tasks

def parse_date(ts):
    if not ts:
        return None
    return datetime.fromtimestamp(int(ts) / 1000)

def classify_tasks(tasks, dias_atras, dias_frente):
    now = datetime.now()
    cutoff_start = now - timedelta(days=dias_atras)
    cutoff_end = now + timedelta(days=dias_frente)
    
    finished = []
    blocked = []
    overdue = []
    upcoming = []
    in_progress = []
    
    for t in tasks:
        status_name = t.get("status", {}).get("status", "unknown")
        status_type = t.get("status", {}).get("type", "open")
        due_ts = t.get("due_date")
        due_date = parse_date(due_ts)
        closed_ts = t.get("date_done")
        closed_date = parse_date(closed_ts)
        assignees = t.get("assignees", [])
        assignee_names = [a.get("username", a.get("email", "?")) for a in assignees]
        
        task_info = {
            "id": t["id"],
            "name": t["name"],
            "status": status_name,
            "folder": t.get("_folder", ""),
            "list": t.get("_list", ""),
            "due": due_date.strftime("%d/%m/%Y") if due_date else None,
            "due_ts": due_ts,
            "closed": closed_date.strftime("%d/%m/%Y") if closed_date else None,
            "assignees": assignee_names,
            "url": f"https://app.clickup.com/t/{t['id']}",
            "priority": (t.get("priority") or {}).get("priority", None),
        }
        
        if status_type == "closed":
            if closed_date and cutoff_start <= closed_date <= now:
                finished.append(task_info)
        elif status_name in ["bloqueio", "blocked"]:
            blocked.append(task_info)
        elif due_date and due_date < now and status_type != "closed":
            overdue.append(task_info)
        elif due_date and now <= due_date <= cutoff_end:
            upcoming.append(task_info)
        elif status_name in ["in progress", "em progresso"]:
            in_progress.append(task_info)
    
    return {
        "finished": sorted(finished, key=lambda x: x["closed"] or "", reverse=True),
        "blocked": blocked,
        "overdue": overdue,
        "upcoming": sorted(upcoming, key=lambda x: x["due_ts"] or ""),
        "in_progress": in_progress,
    }

def print_report(project_name, dias_atras, dias_frente, classified):
    now = datetime.now()
    periodo_start = (now - timedelta(days=dias_atras)).strftime("%d/%m/%Y")
    periodo_end = (now + timedelta(days=dias_frente)).strftime("%d/%m/%Y")
    
    print(f"\n📋 Report ClickUp — {project_name.upper()}")
    print(f"🗓 Período: {periodo_start} a {periodo_end} (hoje: {now.strftime('%d/%m/%Y')})")
    print(f"{'='*50}")
    
    # Group by assignee
    all_by_assignee = {}
    for cat in ["finished", "blocked", "overdue", "upcoming"]:
        for t in classified[cat]:
            for a in t["assignees"]:
                if a not in all_by_assignee:
                    all_by_assignee[a] = {"finished": [], "blocked": [], "overdue": [], "upcoming": []}
                all_by_assignee[a][cat].append(t)
    
    if all_by_assignee:
        print(f"\n👥 TAREFAS POR PESSOA:")
        for person, cats in all_by_assignee.items():
            print(f"\n  [{person}]")
            for cat, task_list in cats.items():
                if task_list:
                    label = {"finished": "✅ Finalizadas", "blocked": "🔴 Bloqueadas", "overdue": "⚠️ Atrasadas", "upcoming": "📌 Próximas"}.get(cat, cat)
                    print(f"    {label}: {len(task_list)}")
                    for t in task_list:
                        extra = f" (due: {t['due']})" if t['due'] else ""
                        extra += f" | closed: {t['closed']}" if t['closed'] else ""
                        print(f"      - {t['name']}{extra}")
    
    print(f"\n\n📊 RESUMO:")
    print(f"  ✅ Finalizadas (período): {len(classified['finished'])}")
    print(f"  🔴 Bloqueadas: {len(classified['blocked'])}")
    print(f"  ⚠️ Atrasadas: {len(classified['overdue'])}")
    print(f"  📌 Próximas ({dias_frente} dias): {len(classified['upcoming'])}")
    print(f"  🔵 Em progresso: {len(classified['in_progress'])}")
    
    print(f"\n\n📌 PRÓXIMAS TAREFAS:")
    for t in classified["upcoming"]:
        assignees = ", ".join(t["assignees"]) if t["assignees"] else "sem assignee"
        print(f"  {t['due']} | {t['status']} | {t['name']} | {assignees}")

def generate_html_report(project_name, dias_atras, dias_frente, classified):
    now = datetime.now()
    periodo_start = (now - timedelta(days=dias_atras)).strftime("%d/%m/%Y")
    periodo_end = (now + timedelta(days=dias_frente)).strftime("%d/%m/%Y")
    
    # Group by assignee
    by_assignee = {}
    for cat in ["finished", "blocked", "overdue", "upcoming"]:
        for t in classified[cat]:
            for a in t["assignees"]:
                if a not in by_assignee:
                    by_assignee[a] = {"finished": [], "blocked": [], "overdue": [], "upcoming": []}
                by_assignee[a][cat].append(t)
    
    # Calculate stats
    total_finished = len(classified["finished"])
    total_blocked = len(classified["blocked"])
    total_overdue = len(classified["overdue"])
    total_upcoming = len(classified["upcoming"])
    total_in_progress = len(classified["in_progress"])
    
    assignee_sections = ""
    for person, cats in by_assignee.items():
        if any(cats.values()):
            sections_html = ""
            for cat, label, emoji in [
                ("finished", "Finalizadas", "✅"),
                ("blocked", "Bloqueadas", "🔴"),
                ("overdue", "Atrasadas", "⚠️"),
                ("upcoming", "Próximas", "📌"),
            ]:
                tasks = cats[cat]
                if tasks:
                    tasks_html = ""
                    for t in tasks:
                        extra = f"<span class='meta'>due: {t['due']}</span>" if t['due'] else ""
                        extra += f" <span class='meta'>closed: {t['closed']}</span>" if t['closed'] else ""
                        tasks_html += f"<li><a href='{t['url']}' target='_blank'>{t['name']}</a> {extra}</li>"
                    sections_html += f"""
        <div class='cat-section'>
          <h4>{emoji} {label} ({len(tasks)})</h4>
          <ul>{tasks_html}</ul>
        </div>
    """
            assignee_sections += f"""
        <div class='person-card'>
            <h3>👤 {person}</h3>
            {sections_html}
        </div>
    """
    
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Report ClickUp — {project_name} {now.strftime('%d/%m/%Y')}</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f1a; color: #e0e0e0; padding: 40px; }}
  h1 {{ color: #8b5cf6; font-size: 24px; margin-bottom: 8px; }}
  .period {{ color: #94a3b8; font-size: 14px; margin-bottom: 32px; }}
  .stats {{ display: flex; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; }}
  .stat {{ background: #1a1a2e; border: 1px solid #2d2d4a; border-radius: 12px; padding: 20px 28px; flex: 1; min-width: 140px; }}
  .stat-num {{ font-size: 32px; font-weight: 700; }}
  .stat-label {{ font-size: 12px; color: #94a3b8; margin-top: 4px; }}
  .stat.finished .stat-num {{ color: #4ade80; }}
  .stat.blocked .stat-num {{ color: #f87171; }}
  .stat.overdue .stat-num {{ color: #fbbf24; }}
  .stat.upcoming .stat-num {{ color: #60a5fa; }}
  .stat.in-progress .stat-num {{ color: #a78bfa; }}
  h2 {{ color: #c4b5fd; font-size: 18px; margin: 32px 0 16px; border-bottom: 1px solid #2d2d4a; padding-bottom: 8px; }}
  .person-card {{ background: #1a1a2e; border: 1px solid #2d2d4a; border-radius: 12px; padding: 24px; margin-bottom: 16px; }}
  .person-card h3 {{ color: #fbbf24; font-size: 16px; margin-bottom: 16px; }}
  .cat-section {{ margin: 16px 0; }}
  .cat-section h4 {{ font-size: 13px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }}
  .cat-section ul {{ list-style: none; }}
  .cat-section li {{ padding: 6px 0; border-bottom: 1px solid #1f1f35; font-size: 14px; }}
  .cat-section li a {{ color: #a78bfa; text-decoration: none; }}
  .cat-section li a:hover {{ color: #c4b5fd; }}
  .meta {{ color: #64748b; font-size: 12px; }}
  .upcoming-list {{ background: #1a1a2e; border: 1px solid #2d2d4a; border-radius: 12px; padding: 24px; }}
  .upcoming-list table {{ width: 100%; border-collapse: collapse; }}
  .upcoming-list th {{ text-align: left; color: #94a3b8; font-size: 11px; text-transform: uppercase; padding: 8px 12px; border-bottom: 1px solid #2d2d4a; }}
  .upcoming-list td {{ padding: 10px 12px; border-bottom: 1px solid #1f1f35; font-size: 14px; }}
  .upcoming-list tr:last-child td {{ border-bottom: none; }}
  .upcoming-list td a {{ color: #a78bfa; text-decoration: none; }}
  .footer {{ margin-top: 48px; text-align: center; color: #475569; font-size: 12px; }}
</style>
</head>
<body>
<h1>📋 Report ClickUp — {project_name.upper()}</h1>
<p class="period">🗓 Período: {periodo_start} a {periodo_end} &nbsp;|&nbsp; Gerado em: {now.strftime('%d/%m/%Y às %H:%M')}</p>

<div class="stats">
  <div class="stat finished">
    <div class="stat-num">{total_finished}</div>
    <div class="stat-label">✅ Finalizadas</div>
  </div>
  <div class="stat blocked">
    <div class="stat-num">{total_blocked}</div>
    <div class="stat-label">🔴 Bloqueadas</div>
  </div>
  <div class="stat overdue">
    <div class="stat-num">{total_overdue}</div>
    <div class="stat-label">⚠️ Atrasadas</div>
  </div>
  <div class="stat in-progress">
    <div class="stat-num">{total_in_progress}</div>
    <div class="stat-label">🔵 Em Progresso</div>
  </div>
  <div class="stat upcoming">
    <div class="stat-num">{total_upcoming}</div>
    <div class="stat-label">📌 Próximas ({dias_frente}d)</div>
  </div>
</div>

<h2>👥 Por Pessoa</h2>
{assignee_sections if assignee_sections else '<p style="color:#64748b">Nenhuma tarefa com pessoas atribuídas.</p>'}

<h2>📌 Próximas Tarefas</h2>
<div class="upcoming-list">
<table>
  <thead>
    <tr>
      <th>Due</th>
      <th>Status</th>
      <th>Tarefa</th>
      <th>Responsável</th>
    </tr>
  </thead>
  <tbody>
    {"".join(f"<tr><td>{t['due'] or '—'}</td><td>{t['status']}</td><td><a href='{t['url']}' target='_blank'>{t['name']}</a></td><td>{', '.join(t['assignees']) if t['assignees'] else '—'}</td></tr>" for t in classified['upcoming'])}
  </tbody>
</table>
</div>

<div class="footer">
Gerado automaticamente via Clara (OpenClaw) — Hoff Consultoria
</div>
</body>
</html>"""
    
    output_dir = f"/root/.openclaw/workspace/reports/{project_name}"
    import os
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{output_dir}/report-{now.strftime('%Y-%m-%d')}.html"
    with open(filename, "w") as f:
        f.write(html)
    return filename

if __name__ == "__main__":
    project = sys.argv[1] if len(sys.argv) > 1 else "santtas"
    dias_atras = int(sys.argv[2]) if len(sys.argv) > 2 else 7
    dias_frente = int(sys.argv[3]) if len(sys.argv) > 3 else 7
    
    creds = load_creds()
    tasks = fetch_all_tasks_by_project(creds, project)
    classified = classify_tasks(tasks, dias_atras, dias_frente)
    print_report(project, dias_atras, dias_frente, classified)
    
    # Generate HTML
    html_path = generate_html_report(project, dias_atras, dias_frente, classified)
    print(f"\n🌐 HTML report: {html_path}")