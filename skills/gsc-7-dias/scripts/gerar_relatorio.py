#!/usr/bin/env python3
"""
GSC 7 Dias — Gerador de Relatório SEO Semanal
Uso: python3 gerar_relatorio.py <gsc_site_url> [output_dir]
Exemplo: python3 gerar_relatorio.py sc-domain:br.santtas.com /root/.openclaw/workspace/mission-control/reports
"""
import sys, json, os
from datetime import datetime, timezone, timedelta

sys.path.insert(0, '/root/.openclaw/credentials')
import gog

def fmt(n):
    return f"{n:,}".replace(",", ".")

def render_template(tpl_path, data, out_path):
    with open(tpl_path) as f:
        tpl = f.read()

    curr = data['curr_d']
    prev = data['prev_d']
    yoy = data['yoy_d']
    from_dt = datetime.fromisoformat(data['from_date'])
    to_dt = datetime.fromisoformat(data['to_date'])
    num_days = data['days']
    daily_avg = curr['clicks'] // num_days if num_days else 0

    yoy_pct = f"{((curr['clicks']/yoy['clicks'])-1)*100:+.1f}%"
    wow_pct = f"{((curr['clicks']/prev['clicks'])-1)*100:+.1f}%"
    wow_change = ((curr['clicks']/prev['clicks'])-1)*100
    wow_color = 'red' if wow_change < 0 else 'green'
    wow_insight = (f"⚠️ <strong style=\"color:#f87171\">Comparativo WoW:</strong> Queda de {abs(wow_change):.1f}% em cliques vs semana anterior. Investigar causa."
                   if wow_change < 0 else
                   f"✅ <strong style=\"color:#34d399\">Comparativo WoW:</strong> Alta de {abs(wow_change):.1f}% em cliques vs semana anterior.")
    yoy_dir = "subiram" if curr['clicks'] > yoy['clicks'] else "caíram"
    yoy_insight = f"📈 Cliques {yoy_dir} {yoy_pct} vs mesmo período de 2025."

    # Pos direction
    pos_dir_yoy = "melhorou ↓" if curr['pos'] < yoy['pos'] else "piorou ↑"
    pos_dir_wow = "piorou" if curr['pos'] > prev['pos'] else "melhorou"
    wow_pos_arrow = "↑" if curr['pos'] > prev['pos'] else "↓"
    wow_pos_color = 'red' if curr['pos'] > prev['pos'] else 'green'
    wow_ctr_color = 'red' if curr['ctr'] < prev['ctr'] else 'green'

    # Period strings
    from_to_str = f"{from_dt.strftime('%d')}–{to_dt.strftime('%d %b %Y')}"
    yoy_period = f"{datetime.fromisoformat(data['yoy_from']).strftime('%d')}–{datetime.fromisoformat(data['yoy_to']).strftime('%d %b %Y')}"
    prev_period = f"{datetime.fromisoformat(data['prev_from']).strftime('%d')}–{datetime.fromisoformat(data['prev_to']).strftime('%d %b %Y')}"

    # Number strings
    curr_clicks = fmt(curr['clicks'])
    curr_impr = fmt(curr['impr'])
    curr_ctr = f"{curr['ctr']*100:.2f}%"
    curr_pos = f"{curr['pos']:.2f}"
    yoy_clicks = fmt(yoy['clicks'])
    yoy_ctr = f"{yoy['ctr']*100:.2f}%"
    yoy_pos = f"{yoy['pos']:.2f}"
    prev_clicks = fmt(prev['clicks'])
    prev_ctr = f"{prev['ctr']*100:.2f}%"
    prev_pos = f"{prev['pos']:.2f}"
    daily_avg_str = fmt(daily_avg)

    # Delta strings
    yoy_delta = f"{curr['clicks']-yoy['clicks']:+d}"
    wow_delta = f"{curr['clicks']-prev['clicks']:+d}"
    yoy_ctr_delta = f"{(curr['ctr']-yoy['ctr'])*100:+.2f}"
    wow_ctr_delta = f"{(curr['ctr']-prev['ctr'])*100:+.2f}"
    pos_delta_yoy = f"{curr['pos']-yoy['pos']:+.2f}"
    pos_delta_wow = f"{curr['pos']-prev['pos']:+.2f}"

    # Daily rows
    max_c = max(r['clicks'] for r in curr['rows']) if curr['rows'] else 1
    daily_rows = ""
    for row in curr['rows']:
        d_str = datetime.fromisoformat(row['keys'][0]).strftime('%d/%b')
        pct = row['clicks'] / max_c * 100
        daily_rows += (f"    <tr><td>{d_str}</td><td class=\"num\">{fmt(row['clicks'])}</td>"
                       f"<td class=\"num\">{fmt(row['impressions'])}</td><td class=\"num\">{row['ctr']*100:.2f}%</td>"
                       f"<td class=\"num\">{row['position']:.2f}</td>"
                       f"<td><div class=\"trend-bar\"><div class=\"trend-bar-fill blue\" style=\"width:{pct:.0f}%\"></div></div></td></tr>\n")

    # Lost queries
    lost_rows = ""
    for r in data['lost']:
        sev = 'crítica' if r['drop'] >= 2 else ('alta' if r['drop'] >= 1 else ('média' if r['drop'] >= 0.5 else 'baixa'))
        lost_rows += (f"    <tr><td>{r['q']}</td><td class=\"num\">{r['old']:.1f}</td><td class=\"num\">{r['new']:.1f}</td>"
                      f"<td class=\"num pos-drop\">+{r['drop']:.1f} ↓</td><td class=\"num\">{fmt(r['c'])}</td>"
                      f"<td class=\"num\">{r['ctr']:.1f}%</td><td><span class=\"badge badge-down\">{sev}</span></td></tr>\n")

    # Improved queries
    impr_rows = ""
    for r in data['impr_l']:
        impr_rows += (f"    <tr class=\"highlight-row\"><td>{r['q']}</td><td class=\"num\">{r['old']:.1f}</td>"
                      f"<td class=\"num\">{r['new']:.1f}</td><td class=\"num pos-gain\">−{r['gain']:.1f} ↑</td>"
                      f"<td class=\"num\">{fmt(r['c'])}</td><td>—</td><td><span class=\"badge badge-up\">boa</span></td></tr>\n")

    # Top queries
    q_rows = ""
    for r in data['top_q']:
        q = r['keys'][0]
        if q.lower() == 'santtas': tag = '<span class="badge badge-brand">marca</span>'
        elif any(g in q.lower() for g in ['londrina','manaus','erechim','poa','florianopolis','joinville']): tag = '<span class="badge badge-up">geo</span>'
        else: tag = '<span class="badge badge-up">genérico</span>'
        q_rows += (f"    <tr class=\"highlight-row\"><td>{q}</td><td class=\"num\">{fmt(r['clicks'])}</td>"
                   f"<td class=\"num\">{fmt(r['impressions'])}</td><td class=\"num\">{r['ctr']*100:.1f}%</td>"
                   f"<td class=\"num\">{r['position']:.1f}</td><td>{tag}</td></tr>\n")

    # Top pages
    p_rows = ""
    for r in data['top_p']:
        p = r['keys'][0].replace('https://br.santtas.com','').replace('https://www.santtas.com','') or '/ (homepage)'
        p_rows += (f"    <tr><td>{p}</td><td class=\"num\">{fmt(r['clicks'])}</td>"
                   f"<td class=\"num\">{fmt(r['impressions'])}</td><td class=\"num\">{r['ctr']*100:.1f}%</td>"
                   f"<td class=\"num\">{r['position']:.1f}</td></tr>\n")

    # Devices
    total_dev = sum(r['clicks'] for r in data['devices'].values())
    dev_map = {'MOBILE': '📱 Mobile', 'DESKTOP': '💻 Desktop', 'TABLET': '📲 Tablet'}
    dev_rows = ""
    for dev_k, dev_r in data['devices'].items():
        share = dev_r['clicks'] / total_dev * 100
        dev_rows += (f"    <tr><td>{dev_map.get(dev_k, dev_k)}</td><td class=\"num\">{fmt(dev_r['clicks'])}</td>"
                     f"<td class=\"num\">{fmt(dev_r['impressions'])}</td><td class=\"num\">{dev_r['ctr']*100:.2f}%</td>"
                     f"<td class=\"num\">{dev_r['position']:.2f}</td>"
                     f"<td><div class=\"trend-bar\"><div class=\"trend-bar-fill green\" style=\"width:{share:.0f}%\"></div></div>"
                     f" <span style=\"font-size:0.72rem;color:#6b7280\">{share:.1f}%</span></td></tr>\n")

    # Countries
    ctry_map = {'bra': '🇧🇷 Brasil', 'ury': '🇺🇾 Uruguai', 'usa': '🇺🇸 Estados Unidos', 'prt': '🇵🇹 Portugal', 'arg': '🇦🇷 Argentina'}
    ctry_rows = ""
    for r in data['countries']:
        ctry_rows += (f"    <tr><td>{ctry_map.get(r['keys'][0], r['keys'][0])} ({r['keys'][0]})</td>"
                      f"<td class=\"num\">{fmt(r['clicks'])}</td><td class=\"num\">{fmt(r['impressions'])}</td>"
                      f"<td class=\"num\">{r['ctr']*100:.1f}%</td><td class=\"num\">{r['position']:.1f}</td></tr>\n")

    site_display = data['site'].replace('sc-domain:', '').replace('https://','').replace('http://','')

    reps = {
        '{{period_label}}': from_to_str,
        '{{from_to_str}}': from_to_str,
        '{{yoy_period}}': yoy_period,
        '{{prev_period}}': prev_period,
        '{{num_days}}': str(num_days),
        '{{curr_clicks}}': curr_clicks,
        '{{curr_impr}}': curr_impr,
        '{{curr_ctr}}': curr_ctr,
        '{{curr_pos}}': curr_pos,
        '{{yoy_clicks}}': yoy_clicks,
        '{{yoy_ctr}}': yoy_ctr,
        '{{yoy_pos}}': yoy_pos,
        '{{yoy_delta}}': yoy_delta,
        '{{yoy_ctr_delta}}': yoy_ctr_delta,
        '{{pos_delta_yoy}}': pos_delta_yoy,
        '{{pos_dir_yoy}}': pos_dir_yoy,
        '{{prev_clicks}}': prev_clicks,
        '{{prev_ctr}}': prev_ctr,
        '{{prev_pos}}': prev_pos,
        '{{wow_delta}}': wow_delta,
        '{{wow_ctr_delta}}': wow_ctr_delta,
        '{{wow_ctr_color}}': wow_ctr_color,
        '{{pos_delta_wow}}': pos_delta_wow,
        '{{pos_dir_wow}}': pos_dir_wow,
        '{{wow_pos_arrow}}': wow_pos_arrow,
        '{{wow_pos_color}}': wow_pos_color,
        '{{yoy_pct}}': yoy_pct,
        '{{wow_pct}}': wow_pct,
        '{{wow_color}}': wow_color,
        '{{yoy_insight}}': yoy_insight,
        '{{wow_insight}}': wow_insight,
        '{{lost_count}}': str(len(data['lost'])),
        '{{impr_count}}': str(len(data['impr_l'])),
        '{{daily_avg}}': daily_avg_str,
        '{{daily_rows}}': daily_rows,
        '{{lost_rows}}': lost_rows,
        '{{impr_rows}}': impr_rows,
        '{{q_rows}}': q_rows,
        '{{p_rows}}': p_rows,
        '{{dev_rows}}': dev_rows,
        '{{ctry_rows}}': ctry_rows,
        '{{site_display}}': site_display,
        '{{today_str}}': data['today_str'],
    }

    html = tpl
    for k, v in reps.items():
        html = html.replace(k, v)

    with open(out_path, 'w') as f:
        f.write(html)
    print(f"[GSC 7 Dias] HTML salvo em: {out_path}")
    return out_path


def main():
    site = sys.argv[1] if len(sys.argv) > 1 else 'sc-domain:br.santtas.com'
    output_dir = sys.argv[2] if len(sys.argv) > 2 else '/root/.openclaw/workspace/mission-control/reports'
    os.makedirs(output_dir, exist_ok=True)

    today = datetime.now(timezone.utc)
    to_date = (today - timedelta(days=1)).strftime('%Y-%m-%d')
    from_date = (today - timedelta(days=8)).strftime('%Y-%m-%d')

    from_dt = datetime.fromisoformat(from_date)
    to_dt = datetime.fromisoformat(to_date)
    fname = f"seo-recap-{from_dt.strftime('%d-%m')}-{to_dt.strftime('%d-%m-%Y')}.html"
    out_path = os.path.join(output_dir, fname)

    print(f"[GSC 7 Dias] Período: {from_date} → {to_date}")
    print(f"[GSC 7 Dias] Site: {site}")

    curr = gog.gsc_search_analytics(site, {
        'startDate': from_date, 'endDate': to_date,
        'dimensions': ['date'], 'aggregationType': 'byProperty', 'rowLimit': 10
    })
    yoy_from = (from_dt - timedelta(days=365)).strftime('%Y-%m-%d')
    yoy_to = (to_dt - timedelta(days=365)).strftime('%Y-%m-%d')
    yoy = gog.gsc_search_analytics(site, {
        'startDate': yoy_from, 'endDate': yoy_to,
        'dimensions': ['date'], 'aggregationType': 'byProperty', 'rowLimit': 10
    })
    prev_from = (from_dt - timedelta(days=7)).strftime('%Y-%m-%d')
    prev_to = (from_dt - timedelta(days=1)).strftime('%Y-%m-%d')
    prev = gog.gsc_search_analytics(site, {
        'startDate': prev_from, 'endDate': prev_to,
        'dimensions': ['date'], 'aggregationType': 'byProperty', 'rowLimit': 10
    })
    q30 = gog.gsc_search_analytics(site, {
        'startDate': (today - timedelta(days=30)).strftime('%Y-%m-%d'), 'endDate': to_date,
        'dimensions': ['query'], 'rowLimit': 300
    })
    q60 = gog.gsc_search_analytics(site, {
        'startDate': (today - timedelta(days=60)).strftime('%Y-%m-%d'),
        'endDate': (today - timedelta(days=31)).strftime('%Y-%m-%d'),
        'dimensions': ['query'], 'rowLimit': 300
    })
    top_q = gog.gsc_search_analytics(site, {
        'startDate': from_date, 'endDate': to_date,
        'dimensions': ['query'], 'rowLimit': 20
    })
    top_p = gog.gsc_search_analytics(site, {
        'startDate': from_date, 'endDate': to_date,
        'dimensions': ['page'], 'rowLimit': 15
    })
    dev = gog.gsc_search_analytics(site, {
        'startDate': from_date, 'endDate': to_date,
        'dimensions': ['device'], 'aggregationType': 'byProperty', 'rowLimit': 5
    })
    geo = gog.gsc_search_analytics(site, {
        'startDate': from_date, 'endDate': to_date,
        'dimensions': ['country'], 'rowLimit': 5
    })

    def agg(data):
        rows = data.get('rows', [])
        clicks = sum(r['clicks'] for r in rows)
        impr = sum(r['impressions'] for r in rows)
        pos = sum(r['clicks'] * r['position'] for r in rows) / clicks if clicks else 0
        ctr = clicks / impr if impr else 0
        return {'clicks': clicks, 'impr': impr, 'ctr': ctr, 'pos': pos, 'rows': rows}

    curr_d = agg(curr)
    prev_d = agg(prev)
    yoy_d = agg(yoy)

    r30 = {r['keys'][0]: r for r in q30.get('rows', [])}
    r60 = {r['keys'][0]: r for r in q60.get('rows', [])}
    lost = []
    impr_l = []
    for q in r30:
        if q in r60 and r30[q]['clicks'] > 50 and r60[q]['clicks'] > 50:
            op, np = r60[q]['position'], r30[q]['position']
            if np > op + 0.5:
                lost.append({'q': q, 'old': op, 'new': np, 'drop': np-op, 'c': r30[q]['clicks'], 'ctr': r30[q]['ctr']*100})
            elif op > np + 0.5:
                impr_l.append({'q': q, 'old': op, 'new': np, 'gain': op-np, 'c': r30[q]['clicks']})
    lost.sort(key=lambda x: x['drop'], reverse=True)
    impr_l.sort(key=lambda x: x['gain'], reverse=True)

    data = {
        'from_date': from_date, 'to_date': to_date,
        'yoy_from': yoy_from, 'yoy_to': yoy_to,
        'prev_from': prev_from, 'prev_to': prev_to,
        'curr_d': curr_d, 'prev_d': prev_d, 'yoy_d': yoy_d,
        'lost': lost[:10], 'impr_l': impr_l[:8],
        'top_q': sorted(top_q.get('rows', []), key=lambda x: x['clicks'], reverse=True)[:15],
        'top_p': sorted(top_p.get('rows', []), key=lambda x: x['clicks'], reverse=True)[:15],
        'devices': {r['keys'][0]: r for r in dev.get('rows', [])},
        'countries': sorted(geo.get('rows', []), key=lambda x: x['clicks'], reverse=True),
        'today_str': today.strftime('%d/%m/%Y'),
        'site': site,
        'days': len(curr_d.get('rows', []))
    }

    tpl_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', 'assets', 'template.html')
    render_template(tpl_path, data, out_path)

    yoy_pct = f"{((curr_d['clicks']/yoy_d['clicks'])-1)*100:+.1f}%"
    wow_pct = f"{((curr_d['clicks']/prev_d['clicks'])-1)*100:+.1f}%"
    print(f"[GSC 7 Dias] OK — {curr_d['clicks']:,} cliques | {yoy_pct} YoY | {wow_pct} WoW | {len(lost)} caídas | {len(impr_l)} subiram")
    print(f"[GSC 7 Dias] Output: {out_path}")

if __name__ == '__main__':
    main()
