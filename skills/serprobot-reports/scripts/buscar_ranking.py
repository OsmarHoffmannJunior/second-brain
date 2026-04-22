#!/usr/bin/env python3
"""
SerproBot Ranking — Busca e análise de keywords
Uso: python3 buscar_ranking.py [project_id] [keyword_opcional]
     Default project_id = 1262084 (Santtas)
"""
import sys, json, urllib.request
from datetime import datetime

API_KEY = "d84693ef60e0fd23fe6b2c675f9b6bc1"
DEFAULT_PROJECT = "1262084"

def fetch_report(project_id):
    url = f"https://api.serprobot.com/v1/api.php?api_key={API_KEY}&action=project_report&project_id={project_id}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())

def analyze(data, filter_kw=None, project_label=None):
    kw_list = data['report_data']
    period = f"{data['start']} a {data['end']}"
    total = len(kw_list)
    label = project_label or f"project_id={data['id']}"

    if filter_kw:
        kw_list = [k for k in kw_list if filter_kw.lower() in k['keyword'].lower()]

    improved = sorted([k for k in kw_list if k.get('change') and k['change'] < 0], key=lambda x: x['change'])
    dropped = sorted([k for k in kw_list if k.get('change') and k['change'] > 0], key=lambda x: -x['change'])
    stable = [k for k in kw_list if k.get('change') == 0]
    new = [k for k in kw_list if k.get('first_ever_position') is None and k.get('change') == 0]
    no_pos = [k for k in kw_list if k.get('latest_position') is None]

    print(f"📊 SerproBot — {label} | {total} keywords | Período: {period}")
    if filter_kw:
        print(f"🔍 Filtro: '{filter_kw}' | {len(kw_list)} resultados")

    print(f"\n🟢 Melhoraram: {len(improved)}")
    for k in improved[:10]:
        print(f"  {k['keyword']:40s} change:{k['change']:4d} | pos:{str(k['latest_position']):>3} (best ever: {k['best_ever_position']})")

    print(f"\n🔴 Civeram: {len(dropped)}")
    for k in dropped[:10]:
        print(f"  {k['keyword']:40s} change:+{k['change']:3d} | pos:{str(k['latest_position']):>3} (best ever: {k['best_ever_position']})")

    print(f"\n⚪ Estáveis: {len(stable)}")
    print(f"🆕 Recém-adicionadas (first_ever=null): {len(new)}")
    print(f"❓ Sem posição (null): {len(no_pos)}")

    return {
        'total': total,
        'improved': improved,
        'dropped': dropped,
        'stable': stable,
        'new': new,
        'no_pos': no_pos,
        'period': period
    }

if __name__ == '__main__':
    args = sys.argv[1:]
    project_id = args[0] if args and args[0].isdigit() else DEFAULT_PROJECT
    filter_kw = args[1] if len(args) > 1 else (args[0] if args and not args[0].isdigit() else None)

    data = fetch_report(project_id)
    with open('/tmp/serprobot_report.json', 'w') as f:
        json.dump(data, f)

    result = analyze(data, filter_kw, f"project_id={project_id}")
    print(f"\n📁 Dados salvos em /tmp/serprobot_report.json")
    print(f"⏰ Atualizado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")