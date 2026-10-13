#!/usr/bin/env python3
"""Validate S01-A internal integrity. No academic/theological fact validation implied."""
from pathlib import Path
import json,collections,sys
P=Path(__file__).resolve().parents[1];ROOT=P.parents[1]
errors=[]
def load(file):return json.loads((P/'data'/file).read_text(encoding='utf8'))
def chk(t,msg):
 if not t:errors.append(msg)
eps=load('episode_index.json');sceneSets=load('scenes.json');verses=load('verse_coverage.json');geos=load('geography.json');claims=load('claims.json');srcs=load('source_register.json');art=load('assets_manifest.json');lessons=load('lessons.json');slice=load('release_slice_v1_2.json');chapters=load('chapters.json')
MAX={1:31,2:25,3:24,4:26,5:32,6:22,7:24,8:22,9:29,10:32,11:32}
ids=[e['id'] for e in eps];chk(len(ids)==22 and len(set(ids))==22,'22 unique episodes')
chk(ids==[f'ep-gen-{i:03d}' for i in range(1,23)],'stable ordered episode ids')
chk(len(claims)==16 and len(set(x['claimId'] for x in claims))==16,'16 unique claims')
claimids={x['claimId'] for x in claims};srids={x['id'] for x in srcs}
for c in claims:
 chk(set(c['sourceIds'])<=srids,'missing source '+c['claimId'])
 chk(c['humanReview']=='pending' and c['published'] is False,'claim review inflation '+c['claimId'])
for i,e in enumerate(eps):
 chk(e['canonicalOutcomeLocked'] and e['releaseReady'] is False,'outcome lock/release '+e['id'])
 chk(e['canonicalNextId']==(ids[i+1] if i<21 else 'handoff-gen-012'),'fixed ordered next '+e['id'])
 chk(set(e['claimIds'])<=claimids,'unknown claim '+e['id'])
 chk(all(k in e['review'] for k in ('historical','theological','map','rights','lesson')),'missing reviews '+e['id'])
 chk(e['review']['rights']=='not_cleared','false rights clearance '+e['id'])
 chk(e['mapMode'] in ('none','symbolic','conceptual','region_uncertain'),'unknown map mode '+e['id'])
chk(len(sceneSets)==len(geos)==len(art)==len(lessons)==22,'one scene/map/asset/lesson per ep')
for graph in sceneSets:
 eid=graph['episodeId']; scenes=graph['scenes'];ids2={s['id'] for s in scenes};chk(graph['entrySceneId'] in ids2,'missing entry '+eid)
 chk(len(scenes)==5 and len(ids2)==5,'5 unique scenes '+eid)
 chk(sum(1 for s in scenes if s['sceneType']=='locked_canonical_outcome')==1,'one outcome '+eid)
 for s in scenes:
  for ch in s['choices']:
   chk(ch['next'] in ids2,'dangling scene: '+ch['id'])
   chk(ch['kind'] in ('inspection','learning_focus','narrative_perspective','reflection'),'disallowed choice type '+ch['id'])
   chk(ch['effect']['type'] in ('set_perspective','reveal_card','open_panel','mark_visited'),'mutation not allowed '+ch['id'])
   chk('canonicalOutcome' not in str(ch['effect']) and 'canonicalNext' not in str(ch['effect']),'tampered canon '+ch['id'])
  # all paths converge at recap using recursion
  memo=set()
  def reaches_recap(curr, seen):
   if curr in seen:return False
   obj=next(x for x in scenes if x['id']==curr)
   if obj['sceneType']=='locked_canonical_outcome':return True
   return bool(obj['choices']) and all(reaches_recap(c['next'],seen|{curr}) for c in obj['choices'])
  chk(reaches_recap(s['id'],set()),'nonconverging or cyclic '+s['id'])
for g in geos:
 chk(g['coordinatePin'] is None and g['boundaryPolygon'] is None and g['eraAbsoluteBce'] is None,'unsupported coordinates/era '+g['episodeId'])
for a in art:chk(not a['licensedAssetPresent'] and a['imageFile'] is None and a['productionStatus']=='not_created','false illustration deliverable '+a['id'])
for l in lessons:chk(l['reviewStatus']=='draft_not_educator_approved','lesson approved without review '+l['id'])
coverage=collections.Counter((int(v['chapterId'].split('.')[1]),v['verse']) for v in verses)
expected={(c,v) for c,n in MAX.items() for v in range(1,n+1)}
chk(set(coverage)==expected,'Genesis 1-11 verse coverage missing/excess')
chk(all(k==1 for k in coverage.values()),'overlapping verse coverage')
chk(len(chapters)==11,'chapter index 11')
for ch in chapters:
 c=int(ch['chapterId'].split('.')[1]);chk(ch['verses']==MAX[c],'chapter verse length invalid')
 chk(set(ch['episodeIds'])=={v['episodeId'] for v in verses if v['chapterId']==ch['chapterId']},'chapter episode index mismatch')
for e in eps:
 rs=e['passage']['start'];re=e['passage']['end']
 mapped=[(int(v['chapterId'].split('.')[1]),v['verse']) for v in verses if v['episodeId']==e['id']]
 chk(mapped and min(mapped)==(rs['chapter'],rs['verse']) and max(mapped)==(re['chapter'],re['verse']),'passage range issue '+e['id'])
chk(len(slice['episodes'])==22 and slice['content']['published'] is False,'v1.2 slice draft')
chk(all(e['outcomeLocked'] and e['notForPublicRelease'] for e in slice['episodes']),'slice lock')
try:
 import jsonschema
 jsonschema.Draft202012Validator.check_schema(json.loads((P/'schemas/episode_details.schema.json').read_text()))
 jsonschema.validate(eps,json.loads((P/'schemas/episode_details.schema.json').read_text()))
 jsonschema.validate(slice,json.loads((ROOT/'master/schemas/release_slice.schema.json').read_text()))
 validation='jsonschema fully checked'
except ImportError:validation='JSON package valid; install jsonschema to perform complete schema verification'
except Exception as ex:errors.append(f'schema violation: {ex}');validation='schema FAIL'
result={'status':'PASS' if not errors else 'FAIL','episodes':len(eps),'versesIndexed':len(coverage),'chapters':len(chapters),'scenes':sum(len(x['scenes']) for x in sceneSets),'choices':sum(len(s['choices']) for g in sceneSets for s in g['scenes']),'claimRecords':len(claims),'artBriefs':len(art),'lessonDrafts':len(lessons),'schema':validation,'errors':errors}
print(json.dumps(result,indent=2,ensure_ascii=False));sys.exit(0 if not errors else 1)
