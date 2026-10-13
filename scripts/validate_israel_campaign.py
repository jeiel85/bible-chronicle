#!/usr/bin/env python3
"""Validates index/completeness/links only. Does not certify biblical or external history."""
from __future__ import annotations
from pathlib import Path
from collections import Counter
import json, sys
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'data/campaign_israel'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
books={b['id']:b for b in load(ROOT/'data/books.json')}
periods=load(D/'campaign_periods.json'); events=load(D/'campaign_events_index.json')
rulers=load(D/'rulers.json'); prophets=load(D/'prophets_cross_index.json')
coverage=load(D/'chapter_campaign_coverage.json'); sources=load(D/'reviewed_sources.json')
anchors=load(D/'historical_anchor_reviews.json'); report=load(D/'coverage_summary.json')
errors=[]
def check(ok,msg):
 if not ok: errors.append(msg)
def check_refs(refs,where):
 for r in refs:
  bk=books.get(r['bookId']); a=r['chapterStart']; z=r['chapterEnd']
  check(bk is not None and 1<=a<=z<=bk['chapters'] if bk else False, f'Invalid reference {where}: {r}')

pids={p['id'] for p in periods}; ids=[e['id'] for e in events]
check(len(periods)==22,'Period count changed')
check(len(events)==219,'Episode count changed; re-review coverage and test expectations')
check(len(set(ids))==len(events),'Duplicate event IDs')
check([e['displayOrder'] for e in events]==list(range(1,len(events)+1)),'Broken display order')
check(len([e for e in events if e['periodId']=='PXX'])==1,'Undated appendix unexpected')
for e in events:
 check(e['periodId'] in pids, f'Invalid period {e["id"]}')
 check(e['canonicalOutcomeLocked'] is True, f'Mutable canonical state {e["id"]}')
 check(e['contentStatus']=='outline_not_authored', f'Unreviewed episode incorrectly marked authored: {e["id"]}')
 check(e['historicalFactcheckStatus']=='pending_per_event_review', f'Unreviewed history incorrectly marked reviewed: {e["id"]}')
 check(e['mapStatus']=='unverified', f'Unreviewed map mislabeled: {e["id"]}')
 check(e['date']['kind']=='unreviewed', f'Unreviewed date was asserted: {e["id"]}')
 check(bool(e['scriptureRefs']),f'No scripture refs {e["id"]}')
 if e['periodId']=='PXX':check(e['timelinePlacement']=='non_chronological_appendix','Undated literature is placed on chronology')
 check_refs(e['scriptureRefs'],e['id'])

by_kingdom=Counter(x['kingdom'] for x in rulers['rulers'])
check(by_kingdom==Counter({'united':3,'north':19,'south':20}),f'Ruler counts {by_kingdom}')
check(len({r['id'] for r in rulers['rulers']})==42,'Duplicate ruler id')
check(len([r for r in rulers['rulers'] if r['role']=='queen_regnant'])==1,'Athaliah missing or incorrect')
for r in rulers['rulers']:
 check(r['startBce'] is None and r['endBce'] is None,'Unverified regnal dates inserted')
 check_refs(r['scriptureRefs'],r['id'])
for p in prophets:
 check(p['suggestedPeriodId'] is None or p['suggestedPeriodId'] in pids,'Unknown period in prophets')
 check_refs(p['scriptureRefs'],p['nameKo'])
 check(p['authored'] is False,'Prophet outline mislabeled authored')
check({p['nameKo'] for p in prophets}.issuperset({'요엘','오바댜','예레미야','에스겔','아모스','호세아','엘리야'}),'Missing key prophet')

need={(b,ch) for b in ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','EZR','NEH','EST'] for ch in range(1,books[b]['chapters']+1)}
check({(c['bookId'],c['chapter']) for c in coverage}==need,'Scope coverage missing/duplicate chapters')
check(len(coverage)==len(need)==686,f'Coverage must be 686, got {len(coverage)}')
links={(e['id'],r['bookId'],ch) for e in events for r in e['scriptureRefs'] for ch in range(r['chapterStart'],r['chapterEnd']+1)}
for c in coverage:
 check(bool(c['linkedCampaignEventIds']),f'Unlinked chapter: {c["bookId"]}:{c["chapter"]}')
 check(not c['actualLessonAuthored'],f'Chapter claimed authored: {c["bookId"]}:{c["chapter"]}')
 for id in c['linkedCampaignEventIds']:
  check((id,c['bookId'],c['chapter']) in links,f'Invalid coverage link {id}:{c["bookId"]}:{c["chapter"]}')
source_ids={s['id'] for s in sources}
check(len(source_ids)==len(sources),'Duplicate source')
for s in sources:
 check(s['url'].startswith('https://'),f'Invalid source URL {s["id"]}')
 check(bool(s['scopeNoteKo']),f'Source scope note missing {s["id"]}')
for a in anchors:
 check(a['periodId'] in pids, f'Invalid historical anchor period {a["id"]}')
 check(all(i in source_ids for i in a['sourceIds']), f'Broken historical source {a["id"]}')
 check_refs(a['scriptureRefs'],a['id'])
check(len(anchors)==9,'Historical anchor set changed')
check(report['episodeOutlineCount']==len(events),'Stale report count')
check(report['chaptersInCampaignScope']==len(coverage),'Stale report chapters')
check(report['chaptersAwaitingOutlineMapping']==[],'Stale gaps')
check(report['allEpisodesAuthored'] is False,'False completeness claim')
check(report['allHistoricalFactsChecked'] is False,'False history fact check claim')
print('Bible Chronicle Israel campaign: index-level structural checks only')
print(f'Periods: {len(periods)}, episode outlines: {len(events)}, rulers: {len(rulers["rulers"])}, prophets: {len(prophets)}, chapter links: {len(coverage)}, source anchors: {len(anchors)}')
if errors:
 print('FAIL:\n'+'\n'.join(' - '+x for x in errors));sys.exit(1)
print('PASS. No assertions about historical truth, scriptural interpretation, or authoring completion.')
