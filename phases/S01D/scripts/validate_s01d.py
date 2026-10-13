#!/usr/bin/env python3
import json, pathlib, collections, sys
P=pathlib.Path(__file__).resolve().parents[1]; ROOT=P.parents[1]
load=lambda n:json.loads((P/'data'/n).read_text(encoding='utf-8'))
errs=[]
def ck(cond,msg):
 if not cond:errs.append(msg)
E=load('episode_index.json');S=load('scenes.json');V=load('verse_coverage.json');CH=load('chapters.json');A=load('assets_manifest.json');L=load('lessons.json');C=load('claims.json');G=load('geography.json');R=load('release_slice_v1_2.json');SRC=load('source_register.json');CHR=load('characters.json');PLC=load('place_catalog.json');HS=load('handoffs.json');IX=load('intertext_links.json')
MAX={37:36,38:30,39:23,40:23,41:57,42:38,43:34,44:34,45:28,46:34,47:31,48:22,49:33,50:26}
ids=[e['id'] for e in E];expected_ids=[f'ep-gen-{i:03d}' for i in range(116,180)]
ck(ids==expected_ids,'S01D stable IDs 116–179')
ck(len(E)==len(S)==len(A)==len(L)==len(C)==len(G)==64,'All linked per-episode arrays 64')
ck(len(V)==449 and sum(MAX.values())==449,'449 verses')
expected={(f'GEN.{ch:03d}',v) for ch,m in MAX.items() for v in range(1,m+1)}
counts=collections.Counter((x['chapterId'],x['verse']) for x in V)
ck(set(counts)==expected and all(n==1 for n in counts.values()),'Verse gaps or overlaps')
ck(len(CH)==14 and {c['chapterId'] for c in CH}=={f'GEN.{ch:03d}' for ch in MAX},'14 chapter descriptors')
for c in CH:
 ch=int(c['chapterId'].split('.')[1]);ck(c['verses']==MAX[ch], 'Chapter verse max');ck(set(c['episodeIds'])=={x['episodeId'] for x in V if x['chapterId']==c['chapterId']},'Chapter-to-episode mismatch')
sids={x['id'] for x in SRC};chars={x['id'] for x in CHR};places={x['id'] for x in PLC};claims={x['id'] for x in C}
ck(len(sids)==len(SRC) and len(chars)==len(CHR) and len(places)==len(PLC) and len(claims)==len(C),'catalog uniqueness')
for data in (S,A,L,C,G):ck({x['episodeId'] for x in data}==set(ids), 'Linked data episode mismatch')
choices_total=0
for i,e in enumerate(E):
 eid=e['id'];p=e['passage'];ch=p['start']['chapter'];lo=p['start']['verse'];hi=p['end']['verse']
 ck(ch==p['end']['chapter'] and (f'GEN.{ch:03d}',lo) in expected and hi<=MAX[ch], 'Passage range '+eid)
 mapped=[x['verse'] for x in V if x['episodeId']==eid]
 ck(mapped==list(range(lo,hi+1)), 'Passage coverage '+eid)
 nxt=ids[i+1] if i<63 else 'handoff-exo-001'
 ck(e['canonicalOutcomeId']==f'canon-gen-{116+i:03d}' and e['canonicalNextId']==nxt and e['canonicalOutcomeLocked'] is True,'Immutable chain '+eid)
 ck(e['releaseReady'] is False and e['absoluteYearBce'] is None and e['historicalStatus']=='biblical_narrative_unverified_externally','Unsafe publication '+eid)
 ck(set(e['castIds'])<=chars and set(e['placeIds'])<=places and set(e['claimIds'])<=claims,'Orphan entity '+eid)
 seq=S[i]['scenes'];scid={x['id'] for x in seq};ck(len(seq)==6 and len(scid)==6,'Scene count '+eid)
 ck(seq[0]['id']==eid+'/opening' and seq[-1]['id']==eid+'/locked-outcome','Scene order '+eid)
 ck(seq[-1]['autoNext']==nxt and seq[-1]['canonicalOutcomeId']==e['canonicalOutcomeId'],'Locked terminal '+eid)
 ck(len(seq[0]['choices'])==4,'Initial choices '+eid)
 for scene in seq:
  for c in scene['choices']:
   choices_total+=1
   ck(c['next'] in scid and c['kind'] in ('inspection','learning_focus','narrative_perspective','reflection'),'Unsafe choice target '+eid)
   ck(c['effect']['type'] in ('set_perspective','reveal_card','open_panel'),'Canonical mutation '+eid)
  if scene not in (seq[0],seq[-1]):ck(scene['autoNext']==eid+'/locked-outcome' and not scene['choices'],'Branch does not rejoin '+eid)
 ck(G[i]['coordinatePin'] is None and G[i]['boundaryPolygon'] is None and G[i]['absoluteBce'] is None,'Unreviewed map pin '+eid)
 ck(A[i]['imageFile'] is None and A[i]['originalAssetProduced'] is False and A[i]['rightsStatus']=='not_cleared','Unapproved art '+eid)
 ck(L[i]['reviewStatus']=='draft_not_educator_approved' and sum(a['isCorrect'] for a in L[i]['answers'])==1,'Quiz integrity '+eid)
 ck(C[i]['published'] is False and C[i]['externalHistoricalEvidence']=='not_established' and set(C[i]['sourceIds'])<=sids,'Historical assertion '+eid)
ck(choices_total==256,'choice count 256')
ck(HS[0]['resolvesTo']=='ep-gen-116' and HS[-1]['resolvesTo'] is None,'Alias continuity')
ck(R['schemaVersion']=='1.2.0' and len(R['episodes'])==64 and R['content']['published'] is False,'schema draft status')
try:
 import jsonschema
 jsonschema.validate(R,json.loads((ROOT/'master/schemas/release_slice.schema.json').read_text(encoding='utf8')))
 schema='PASS'
except ImportError:schema='SKIPPED(jsonschema not installed)'
except Exception as ex:errs.append('Schema: '+str(ex));schema='FAIL'
print(json.dumps({'status':'PASS' if not errs else 'FAIL','episodes':len(E),'verses':len(V),'scenes':sum(len(x['scenes']) for x in S),'choices':choices_total,'schema':schema,'errors':errs},ensure_ascii=False,indent=2));sys.exit(bool(errs))
