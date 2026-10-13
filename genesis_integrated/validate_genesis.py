#!/usr/bin/env python3
import json,pathlib,collections,sys
R=pathlib.Path(__file__).resolve().parents[1];P=pathlib.Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
errors=[]
def ck(ok,msg):
 if not ok:errors.append(msg)
stages=['S01A','S01B','S01C','S01D']
E=[x for stage in stages for x in load(R/'phases'/stage/'data/episode_index.json')]
V=[x for stage in stages for x in load(R/'phases'/stage/'data/verse_coverage.json')]
C=load(P/'genesis_chapter_manifest.json'); chain=load(P/'genesis_episode_chain.json');a={x['aliasId']:x['resolvesTo'] for x in load(P/'handoff_resolution.json')}
ck(len(E)==179 and len({e['id'] for e in E})==179,'179 stable episodes')
ck([e['id'] for e in E]==[f'ep-gen-{x:03d}' for x in range(1,180)],'sequential IDs')
ck(len(V)==1533,'1533 Genesis verses')
counts=collections.Counter((v['chapterId'],v['verse']) for v in V)
ck(len(counts)==len(V) and all(v==1 for v in counts.values()),'verse duplicates')
ck(len(C)==50 and [c['chapter'] for c in C]==list(range(1,51)),'50 chapter records')
reference=load(P/'genesis_verse_count_reference.json')
chapter_max={int(k):v for k,v in reference['chapterVerseCounts'].items()}
ck(len(chapter_max)==50 and sum(chapter_max.values())==1533,'independent chapter verse counts reference')
ck(all(c['versesMapped']==chapter_max[c['chapter']] for c in C),'chapter counts do not match fixed verse reference')
expected={(f'GEN.{ch:03d}',v) for ch,maxv in chapter_max.items() for v in range(1,maxv+1)}
ck(set(counts)==expected,'missing verse or unaligned chapter verse')
refs=collections.Counter(v['episodeId'] for v in V)
ck(set(refs)=={e['id'] for e in E},'unmatched or missing episode verse mapping')
for e in E:
 p=e['passage'];start=p['start'];end=p['end']
 ck(e['canonicalOutcomeLocked'] is True and not e.get('releaseReady',False),'canonical history/publication invariant '+e['id'])
 ck(start['bookId']==end['bookId']=='GEN','wrong book '+e['id'])
 count=sum(1 for v in V if v['episodeId']==e['id']);ck(count==refs[e['id']],'wrong count '+e['id'])
for i,e in enumerate(E):
 nextid=a.get(e['canonicalNextId'],e['canonicalNextId'])
 expected_next=E[i+1]['id'] if i+1<len(E) else None
 ck(nextid==expected_next,'unresolved or wrong chain '+e['id'])
ck(a=={'handoff-gen-012':'ep-gen-023','handoff-gen-026':'ep-gen-064','handoff-gen-037':'ep-gen-116','handoff-exo-001':None},'aliases')
ck(len(chain)==179 and all(x['resolvedNext']==(chain[i+1]['id'] if i<178 else None) for i,x in enumerate(chain)), 'release chain')
books=load(R/'master/data/canon_books.json'); ck(len(books)==66,'66 books preserved')
israel=load(R/'data/campaign_israel/campaign_events_index.json');ck(len(israel)==219,'219 campaign events preserved')
print(json.dumps({'status':'PASS' if not errors else 'FAIL','episodes':len(E),'chapters':len(C),'verseMappings':len(V),'continuousChainStart':E[0]['id'],'continuousChainEnd':E[-1]['id'],'nextHandoff':'handoff-exo-001','historyVerified':False,'published':False,'errors':errors},ensure_ascii=False,indent=2));sys.exit(bool(errors))
